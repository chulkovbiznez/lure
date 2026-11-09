# Новый вход на сайте EAGLES (09.11.2026)
Вставка в index.html сайта (окна #lgn «Вход» и #cdo «Код из письма»), старый код страницы не меняется.
`python3 patch_index.py <живой index.html> <выход>` добавляет перед последним </body> блок `<style id="vhodV1">` + скрипт (vhod.css, vhod.js, логотип eagles-logo.webp).
Откат: залить обратно копию index.html, снятую до вставки.
