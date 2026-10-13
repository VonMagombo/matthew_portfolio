# Year-End Countdown (Android)

Native Kotlin app that counts down to **01/01/2027 00:00 CAT (UTC+02:00)**, the end of 2026,
styled to match the portfolio. No third-party runtime dependencies; minSdk 26 (Android 8.0).

## Get the APK

Every push touching `android/` runs the **Android APK** workflow, which runs the unit tests and
lint, then builds a debug APK. Download it from the run's **Artifacts** section, copy it to
your phone and open it (allow "Install unknown apps" for your browser or file manager when
prompted).

## Build locally

Requires JDK 17 and the Android SDK (Android Studio installs both):

```sh
cd android
./gradlew assembleDebug        # app/build/outputs/apk/debug/app-debug.apk
./gradlew testDebugUnitTest    # countdown math tests
```

The target instant lives in `app/src/main/java/com/vonmagombo/countdown/Countdown.kt`.
