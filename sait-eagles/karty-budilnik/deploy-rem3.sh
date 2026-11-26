#!/bin/bash
# Будильник v3 (26.11.2026): повторы (Карты v51 + сервер REM v3), клавиатура не выскакивает при открытии окна.
set -e
C=$1; [ -n "$C" ] || { echo "нужен коммит"; exit 1; }
mkdir -p ~/krem3 && cd ~/krem3
FID=d4e7hbmkhkj14dq3e8ip; OLD=d4ef5u40fef58mc5hk6c; SA=ajevbo38i28ud6fae5sk; B=app.eaglesteam.ru
CUR=$(yc serverless function version get-by-tag --function-id $FID --tag '$latest' --format json | jq -r .id)
[ "$CUR" = "$OLD" ] || { echo "STOP: живая версия $CUR, а ждали $OLD"; exit 1; }
rm -rf pkg && cp -r ~/krem2/pkg pkg
R=https://raw.githubusercontent.com/chulkovbiznez/lure/$C/sait-eagles/karty-budilnik
for f in p-rem3.py karty-v51.py; do curl -fsS $R/$f -o $f; done
python3 p-rem3.py pkg/server.js && node -e "new (require('vm').Script)(require('fs').readFileSync('pkg/server.js','utf8'))"
curl -fsS https://$B/karty.html -o karty-do-rem3.html
[ "$(md5sum < karty-do-rem3.html | cut -c1-8)" = 71e675c4 ] || { echo "STOP: на сайте не тот karty.html"; exit 1; }
cp karty-do-rem3.html karty.html && python3 karty-v51.py karty.html
echo "ОТКАТ: yc serverless function version create --function-id $FID --source-version-id $OLD ; yc storage s3api put-object --bucket $B --key karty.html --body ~/krem3/karty-do-rem3.html --content-type 'text/html; charset=utf-8' --cache-control no-cache" > rollback.txt
yc serverless function version get $OLD --format json > old.json
ENVS=$(jq -r '.environment|to_entries|map("\(.key)=\(.value)")|join(",")' old.json)
SECS="$(jq -r '.secrets[]|"--secret environment-variable=\(.environment_variable),id=\(.id),version-id=\(.version_id),key=\(.key)"' old.json | tr '\n' ' ')"
NEW=$(yc serverless function version create --function-id $FID --runtime nodejs22 --entrypoint index.handler \
  --memory 256m --execution-timeout 60s --concurrency 1 --service-account-id $SA --log-folder-id b1gdk9v2q7ufbktofk7o \
  --source-path pkg --environment "$ENVS" $SECS --format json | jq -r .id)
echo "NEW $NEW"
echo "tick снаружи: $(curl -s "https://functions.yandexcloud.net/$FID?type=rem_tick" -X POST)  (ждём error no)"
yc storage s3api put-object --bucket $B --key karty.html --body karty.html --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
echo "site: karty $(curl -s https://$B/karty.html | md5sum | cut -c1-8) (файл $(md5sum < karty.html | cut -c1-8))"
echo DEPLOY_DONE
