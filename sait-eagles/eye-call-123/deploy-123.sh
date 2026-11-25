#!/bin/bash
# Задание 123 (25.11.2026): звонок EYE доходит до закрытого приложения. Секретов не печатает.
# 1) сервер сайта: action eye_ring (уведомление «📞 Имя звонит» / «📵 Пропущенный звонок»)
# 2) sw.js: звонок висит и вибрирует; повторные сообщения снова звенят
# 3) сервер звонков EYE v3.5 (ВМ eye): «не в сети» больше не отказ, звонок ждёт друга 50 с
set -e
C=$1; [ -n "$C" ] || { echo "нужен коммит"; exit 1; }
mkdir -p ~/k123 && cd ~/k123
FID=d4e7hbmkhkj14dq3e8ip; OLD=d4eov9cd7n2u28kpsb0f; B=app.eaglesteam.ru
HS=1e786874490665eb6fc0c82838c3495a2367005ad52d9b1eb511fc999e92f5f1; HJ=a9a4f85b9e9a213f23a18cfa1bf0f7653dc21e3d29a6249cf535fea21855d337
CUR=$(yc serverless function version get-by-tag --function-id $FID --tag '$latest' --format json | jq -r .id)
[ "$CUR" = "$OLD" ] || { echo "STOP: живая версия $CUR, а ждали $OLD"; exit 1; }
rm -rf pkg && mkdir pkg && cp ~/k122/pkg/index.js ~/k122/pkg/server.js pkg/
I5=$(md5sum < pkg/index.js | cut -c1-32); S5=$(md5sum < pkg/server.js | cut -c1-32)
echo "live index $I5 (ждали a78becc770a9858db193c945d44352a5) server $S5 (ждали 0139dfa0e86be4826e4d36ad1c22e51c)"
[ "$I5" = a78becc770a9858db193c945d44352a5 ] && [ "$S5" = 0139dfa0e86be4826e4d36ad1c22e51c ] || { echo "STOP: код не тот"; exit 1; }
R=https://raw.githubusercontent.com/chulkovbiznez/lure/$C/sait-eagles/eye-call-123
curl -fsS $R/p123.py -o p123.py; curl -fsS $R/sw.js -o sw.js
python3 p123.py pkg/server.js
[ "$(md5sum < pkg/server.js | cut -c1-32)" = 8fcf4964c254dafa3edc36cfd5560bbf ] || { echo "STOP: патч дал не тот server.js"; exit 1; }
[ "$(md5sum < sw.js | cut -c1-32)" = 32370153d658360752d3a9c703287a56 ] || { echo "STOP: sw.js не тот"; exit 1; }
yc serverless function version get $OLD --format json > old.json
SA=$(jq -r .service_account_id old.json)
ENVS=$(jq -r '.environment|to_entries|map("\(.key)=\(.value)")|join(",")' old.json)
SECS="$(jq -r '.secrets[]|"--secret environment-variable=\(.environment_variable),id=\(.id),version-id=\(.version_id),key=\(.key)"' old.json | tr '\n' ' ')"
curl -s https://$B/sw.js -o sw-do-123.js
MD=$(yc compute instance get --name eye --folder-name ai-chat --format json | jq -r '.metadata["eye-ver"] // ""')
echo "eye-ver до: '${MD}'"
if [ -n "$MD" ]; then EYEBACK="yc compute instance add-metadata --name eye --folder-name ai-chat --metadata eye-ver=\"$MD\""; else EYEBACK="yc compute instance remove-metadata --name eye --folder-name ai-chat --keys eye-ver"; fi
echo "ОТКАТ: сервер: yc serverless function version create --function-id $FID --source-version-id $OLD ; sw.js: yc storage s3api put-object --bucket $B --key sw.js --body ~/k123/sw-do-123.js --content-type application/javascript --cache-control no-cache ; EYE: $EYEBACK && yc compute instance restart --name eye --folder-name ai-chat" > rollback.txt
# 1) сервер сайта
yc serverless function version create --function-id $FID --runtime nodejs22 --entrypoint index.handler \
  --memory 256m --execution-timeout 60s --concurrency 1 --service-account-id $SA --log-folder-id b1gdk9v2q7ufbktofk7o \
  --source-path pkg --environment "$ENVS" $SECS --format json | jq -r '"NEW " + .id + " " + .status'
for i in 1 2 3; do curl -s "https://functions.yandexcloud.net/$FID?action=login_request&login=99999999"; echo; done
echo "eye_ring без входа: $(curl -s "https://functions.yandexcloud.net/$FID?action=eye_ring&with=11111")"
echo "push_key: $(curl -s "https://functions.yandexcloud.net/$FID?action=push_key" | cut -c1-30)"
# 2) sw.js
yc storage s3api put-object --bucket $B --key sw.js --body sw.js --content-type application/javascript --cache-control no-cache >/dev/null
echo "sw на сайте: $(curl -s https://$B/sw.js | md5sum | cut -c1-8) (ждали 32370153)"
# 3) сервер звонков
echo "health до: $(curl -s -m 5 https://eye.eaglesteam.ru/health)"
yc compute instance add-metadata --name eye --folder-name ai-chat --metadata eye-ver="$C $HS $HJ" >/dev/null
yc compute instance restart --name eye --folder-name ai-chat >/dev/null
for i in $(seq 1 30); do sleep 10; H=$(curl -s -m 5 https://eye.eaglesteam.ru/health || true); [ -n "$H" ] && break; done
echo "health после: $H"
echo DEPLOY_DONE
