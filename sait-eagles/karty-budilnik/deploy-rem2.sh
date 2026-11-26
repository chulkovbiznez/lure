#!/bin/bash
# Будильник v2 (26.11.2026 13:45): окно дела как было (karty до v49) + кнопка «Будильник» (v50), сервер REM v2, звук в бакет.
set -e
C=$1; [ -n "$C" ] || { echo "нужен коммит"; exit 1; }
mkdir -p ~/krem2 && cd ~/krem2
FID=d4e7hbmkhkj14dq3e8ip; OLD=d4e40ljj982h5olil09r; SA=ajevbo38i28ud6fae5sk; B=app.eaglesteam.ru
CUR=$(yc serverless function version get-by-tag --function-id $FID --tag '$latest' --format json | jq -r .id)
[ "$CUR" = "$OLD" ] || { echo "STOP: живая версия $CUR, а ждали $OLD"; exit 1; }
rm -rf pkg && cp -r ~/krem/pkg pkg
R=https://raw.githubusercontent.com/chulkovbiznez/lure/$C/sait-eagles/karty-budilnik
for f in p-rem2.py karty-v50.py eagles-budilnik.mp3; do curl -fsS $R/$f -o $f; done
python3 p-rem2.py pkg/server.js && node -e "new (require('vm').Script)(require('fs').readFileSync('pkg/server.js','utf8'))"
curl -fsS https://$B/karty.html -o karty-do-rem2.html
[ "$(md5sum < karty-do-rem2.html | cut -c1-8)" = 7ef8c60b ] || { echo "STOP: на сайте не тот karty.html"; exit 1; }
[ "$(md5sum < ~/krem/karty-do-rem.html | cut -c1-8)" = c494892a ] || { echo "STOP: нет копии karty до v49"; exit 1; }
cp ~/krem/karty-do-rem.html karty.html && python3 karty-v50.py karty.html
echo "ОТКАТ: yc serverless function version create --function-id $FID --source-version-id $OLD ; yc storage s3api put-object --bucket $B --key karty.html --body ~/krem2/karty-do-rem2.html --content-type 'text/html; charset=utf-8' --cache-control no-cache" > rollback.txt
yc serverless function version get $OLD --format json > old.json
ENVS=$(jq -r '.environment|to_entries|map("\(.key)=\(.value)")|join(",")' old.json)
SECS="$(jq -r '.secrets[]|"--secret environment-variable=\(.environment_variable),id=\(.id),version-id=\(.version_id),key=\(.key)"' old.json | tr '\n' ' ')"
NEW=$(yc serverless function version create --function-id $FID --runtime nodejs22 --entrypoint index.handler \
  --memory 256m --execution-timeout 60s --concurrency 1 --service-account-id $SA --log-folder-id b1gdk9v2q7ufbktofk7o \
  --source-path pkg --environment "$ENVS" $SECS --format json | jq -r .id)
echo "NEW $NEW"
echo "tick снаружи: $(curl -s "https://functions.yandexcloud.net/$FID?type=rem_tick" -X POST)  (ждём error no)"
yc storage s3api put-object --bucket $B --key karty-stili/eagles-budilnik.mp3 --body eagles-budilnik.mp3 --content-type audio/mpeg --cache-control max-age=86400 >/dev/null
yc storage s3api put-object --bucket $B --key karty.html --body karty.html --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
echo "site: karty $(curl -s https://$B/karty.html | md5sum | cut -c1-8) (файл $(md5sum < karty.html | cut -c1-8)) mp3 $(curl -s -o /dev/null -w '%{http_code} %{size_download}' https://$B/karty-stili/eagles-budilnik.mp3)"
echo DEPLOY_DONE
