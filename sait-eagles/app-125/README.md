# 125 — без мелькания регистрации при запуске приложения (26.11.2026)
Причина: приложение открывает https://app.eaglesteam.ru/?app=android&v=12 → index.html (страница регистрации, 690 КБ),
переход в профиль стоял в самом конце страницы, поэтому регистрация успевала показаться.
Фикс egFast1: маленький скрипт в начале <head> (после блока сессии/30 дней): если вошёл (eaglesfree_id + eaglesfree_session)
и в адресе нет ?ref= — страница скрыта и сразу location.replace('/profile.html'+location.search).
С ?ref= и без входа всё как раньше.
Сборка: python3 p125.py index-do-125.html site/index.html (живой index md5 9c1a5291 → новый b3b6985e).
Тест: t125.js (Playwright).
