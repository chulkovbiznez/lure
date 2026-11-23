# Задание 113: экраны загрузки и золотые надписи (Контакты, EYRIE, Обучение)

Картинки Андрея из https://claude.ai/artifact/WQNf2j79sy9E7ZA2GDmGWx (23.11.2026).
6 webp кладутся в корень бакета app.eaglesteam.ru. patch113.py правит страницы:
- contacts.html → `python3 patch113.py kontakty вход выход`
- kanal.html → `python3 patch113.py eyrie вход выход`
- obuchenie.html → `python3 patch113.py obuchenie вход выход`

Экран загрузки как в Картах (.zgr #boot), только при первом открытии страницы в сессии браузера.
Надписи вверху только стилями (h1 остаётся). Откат: залить старые html.
Ставить ПОСЛЕ фикса мелькания (kcWait1), патч с ним не конфликтует.
