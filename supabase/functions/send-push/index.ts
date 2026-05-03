import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@highestwash.com";

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── VAPID helpers ─────────────────────────────────────────────────────────────

function b64urlToBytes(s: string): Uint8Array {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(base64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function bytesToB64url(b: Uint8Array): string {
  return btoa(String.fromCharCode(...b))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function buildVapidJwt(audience: string): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: VAPID_SUBJECT };

  const enc = new TextEncoder();
  const headerB64 = bytesToB64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = bytesToB64url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const pkcs8 = b64urlToBytes(VAPID_PRIVATE_KEY);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8", pkcs8,
    { name: "ECDSA", namedCurve: "P-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    enc.encode(signingInput)
  );
  return `${signingInput}.${bytesToB64url(new Uint8Array(sig))}`;
}

// ── Web Push encryption (RFC 8291 / RFC 8188) ─────────────────────────────────

async function encryptPayload(
  subscriptionKeys: { p256dh: string; auth: string },
  plaintext: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const enc = new TextEncoder();
  const receiverPublicKey = b64urlToBytes(subscriptionKeys.p256dh);
  const authSecret = b64urlToBytes(subscriptionKeys.auth);

  // Generate ephemeral sender key
  const senderKP = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"]
  );
  const senderPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", senderKP.publicKey)
  );

  // Import receiver key
  const receiverKey = await crypto.subtle.importKey(
    "raw", receiverPublicKey,
    { name: "ECDH", namedCurve: "P-256" }, false, []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: receiverKey }, senderKP.privateKey, 256)
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF-Extract (auth)
  const prk = await hkdf(authSecret, sharedSecret,
    concat(enc.encode("WebPush: info\0"), receiverPublicKey, senderPublicKeyRaw), 32);

  // HKDF-Expand (cek + nonce)
  const cek = await hkdf(salt, prk, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, prk, enc.encode("Content-Encoding: nonce\0"), 12);

  // Pad + encrypt
  const plaintextBytes = enc.encode(plaintext);
  const padded = new Uint8Array(plaintextBytes.length + 2);
  padded.set(plaintextBytes);
  padded[plaintextBytes.length] = 0x02; // record delimiter

  const cekKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, cekKey, padded)
  );

  return { ciphertext: encrypted, salt, serverPublicKey: senderPublicKeyRaw };
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info }, key, len * 8
  );
  return new Uint8Array(bits);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

// ── Send one push ─────────────────────────────────────────────────────────────

async function sendPush(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}, payload: object): Promise<void> {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await buildVapidJwt(audience);

  const body = JSON.stringify(payload);
  const { ciphertext, salt, serverPublicKey } = await encryptPayload(subscription.keys, body);

  // Build aes128gcm content-encoding header (RFC 8188 §2.1)
  const header = new Uint8Array(21 + serverPublicKey.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096, false); // record size
  header[20] = serverPublicKey.length;
  header.set(serverPublicKey, 21);

  const body2 = concat(header, ciphertext);

  const res = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "86400",
    },
    body: body2,
  });

  if (!res.ok && res.status !== 201) {
    const text = await res.text().catch(() => "");
    throw new Error(`Push failed ${res.status}: ${text}`);
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const { merchant_id, title, body, url, tag } = await req.json();
    if (!merchant_id) return new Response("merchant_id required", { status: 400 });

    const { data: subs, error } = await db
      .from("push_subscriptions")
      .select("endpoint, keys")
      .eq("merchant_id", merchant_id);

    if (error) throw error;
    if (!subs?.length) return new Response(JSON.stringify({ sent: 0 }), { status: 200, headers: { "Content-Type": "application/json" } });

    const payload = { title: title ?? "Highest Wash", body, url, tag };
    const results = await Promise.allSettled(subs.map((s: any) => sendPush(s, payload)));

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    failed.forEach((f) => console.error("Push error:", f.reason));

    return new Response(JSON.stringify({ sent, total: subs.length }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
