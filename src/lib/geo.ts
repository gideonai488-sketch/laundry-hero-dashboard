/**
 * Cross-platform geolocation helper.
 *
 * On Android/iOS (Capacitor) we use @capacitor/geolocation which triggers
 * the native OS permission dialog and reads the real device GPS.
 *
 * On web (browser preview / desktop) we fall back to navigator.geolocation.
 */

export interface GeoCoords {
  lat: number;
  lng: number;
  accuracy?: number;
}

function isCapacitor(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window as any).Capacitor?.isNativePlatform?.()
  );
}

export async function getCurrentPosition(): Promise<GeoCoords> {
  if (isCapacitor()) {
    const { Geolocation } = await import("@capacitor/geolocation");

    const perm = await Geolocation.requestPermissions();
    if (
      perm.location !== "granted" &&
      perm.coarseLocation !== "granted"
    ) {
      throw new Error(
        "Location permission denied. Please enable it in Settings → App permissions."
      );
    }

    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });

    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    };
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}
