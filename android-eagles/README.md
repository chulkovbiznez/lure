# EAGLES для Android (TWA)
Оболочка Trusted Web Activity вокруг https://app.eaglesteam.ru (PWA, задание 25.11.2026).
Сборка: GitHub Actions `android-eagles-apk` собирает неподписанный APK и кладёт в `out/`.
Подпись — вне CI, ключ НЕ в репозитории. Отпечаток ключа → `/.well-known/assetlinks.json` на сайте.
Без Chrome на телефоне открывается во встроенном WebView (FALLBACK_STRATEGY=webview).
