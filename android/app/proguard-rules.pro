# Keep line numbers for readable crash reports in Play Console
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ── Capacitor core ──────────────────────────────────────────────────────────
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public *;
}

# ── WebView JS bridge ────────────────────────────────────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── AndroidX / AppCompat ─────────────────────────────────────────────────────
-keep class androidx.appcompat.** { *; }
-keep class androidx.core.** { *; }
-keep class androidx.coordinatorlayout.** { *; }

# ── Splash screen ────────────────────────────────────────────────────────────
-keep class androidx.core.splashscreen.** { *; }

# ── Highestwash app package ──────────────────────────────────────────────────
-keep class com.highestwash.merchants.** { *; }

# ── Suppress warnings for missing optional deps ──────────────────────────────
-dontwarn com.google.android.gms.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
