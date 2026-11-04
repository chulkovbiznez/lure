# LURE by EAGLES

Сервис нейросетей для участников EAGLES: lure.eaglesteam.ru.

- `server.js` — сервер без внешних библиотек (Node 22). Вход через сервер EAGLES (`login_request`, `login_verify`, `me`), кошелёк в рублях, чат через движок New API, коды пополнения, касса владельца.
- Вход: код на почту один раз на устройство, дальше ПИН — общий с сайтом EAGLES (`pin_state`, `pin_set`, `pin_check`, `pin_rec_*`). Доступ только с подпиской EAGLES Pro, при первом входе — «Правила LURE».
- Диалоги хранятся на сервере (`data/dialogs/<ID>/`), видны с любого устройства.
- `public/` — страница LURE (дизайн EAGLES), оферта, политика, согласие.
- `install-lure.sh` — установка на ВМ ai-chat (docker compose + Caddy).

Переменные (файл /opt/ai-chat/lure.env на сервере, в репозиторий не кладётся): `NEWAPI_KEY`, `OWNER_IDS`, `RUB_PER_UNIT` (1 «$» New API = 100 ₽), `DAY_LIMIT_RUB`, `WELCOME_RUB`; по желанию `LOCK_MIN` (через сколько минут без дела снова ПИН, 30), `DIALOGS_MAX`, `DIALOGS_USER_MB`.

Цены берутся из движка New API (`/api/pricing`: model ratio × completion ratio × group ratio), поэтому меняются только там.
Деньги LURE не связаны с оплатами и бинаром EAGLES.

## Белые списки (вечером в некоторых городах)
Открываются только сервисы Яндекса, поэтому браузер ходит не на сервер, а так:
- страница лежит в Object Storage, бакет `lure.eaglesteam.ru` (как сайт EAGLES), сертификат из Certificate Manager;
- запросы идут в функцию `lure-gw` (`gateway/index.js`, functions.yandexcloud.net), она передаёт их на сервер: `https://ai.eaglesteam.ru/lure-gw/...` → сервис lure;
- адрес функции записан в `public/config.js` (`window.LURE_API`). Пустой — страница ходит на свой сервер напрямую.
