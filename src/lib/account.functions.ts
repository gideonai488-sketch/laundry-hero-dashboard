import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SUPABASE_URL = "https://jxilnjudduetykuxiehp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4aWxuanVkZHVldHlrdXhpZWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTQ5NDcsImV4cCI6MjA5Mzc5MDk0N30.iJHSz-8QQ_VoUd25E0890PgBfaC4b8igNSSyy9LZVc4";

const DeleteAccountInput = z.object({
  accessToken: z.string().min(20),
});

export const deleteCurrentAccount = createServerFn({ method: "POST" })
  .inputValidator((data) => DeleteAccountInput.parse(data))
  .handler(async ({ data }) => {
    const userClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${data.accessToken}` } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser(data.accessToken);
    if (userError || !user) throw new Error("Unauthorized. Please sign in again.");

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) throw new Error("Account deletion is not configured yet.");

    const adminClient = createClient(SUPABASE_URL, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    await Promise.allSettled([
      adminClient.from("merchants").delete().eq("owner_id", user.id),
      adminClient.from("user_roles").delete().eq("user_id", user.id),
      adminClient.from("profiles").delete().eq("id", user.id),
    ]);

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw new Error(deleteError.message || "Failed to delete account.");

    return { success: true };
  });