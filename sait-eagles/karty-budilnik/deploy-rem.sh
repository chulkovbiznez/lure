#!/bin/bash
# Будильник Карт (26.11.2026): сервер + karty.html + sw.js + таймер раз в минуту. Секретов не печатает.
set -e
C=$1; [ -n "$C" ] || { echo "нужен коммит"; exit 1; }
mkdir -p ~/krem && cd ~/krem
FID=d4e7hbmkhkj14dq3e8ip; OLD=d4eisvvchjvfkf5h8ah8; SA=ajevbo38i28ud6fae5sk; B=app.eaglesteam.ru
CUR=$(yc serverless function version get-by-tag --function-id $FID --tag '$latest' --format json | jq -r .id)
[ "$CUR" = "$OLD" ] || { echo "STOP: живая версия $CUR, а ждали $OLD"; exit 1; }
rm -rf pkg && mkdir pkg && cp ~/k123/pkg/index.js ~/k123/pkg/server.js pkg/
I5=$(md5sum < pkg/index.js | cut -c1-8); S5=$(md5sum < pkg/server.js | cut -c1-8)
[ "$I5" = a78becc7 ] && [ "$S5" = 8fcf4964 ] || { echo "STOP: код k123 не тот ($I5 $S5)"; exit 1; }
R=https://raw.githubusercontent.com/chulkovbiznez/lure/$C/sait-eagles/karty-budilnik
for f in p-rem.py karty-v49.py sw-rem.py; do curl -fsS $R/$f -o $f; done
python3 p-rem.py pkg/index.js pkg/server.js && node --check pkg/index.js && node -e "new (require('vm').Script)(require('fs').readFileSync('pkg/server.js','utf8'))"
curl -fsS https://$B/karty.html -o karty-do-rem.html; curl -fsS https://$B/sw.js -o sw-do-rem.js
K5=$(md5sum < karty-do-rem.html | cut -c1-8); W5=$(md5sum < sw-do-rem.js | cut -c1-8)
[ "$K5" = c494892a ] && [ "$W5" = 32370153 ] || { echo "STOP: на сайте другие karty/sw ($K5 $W5)"; exit 1; }
cp karty-do-rem.html karty.html && python3 karty-v49.py karty.html
cp sw-do-rem.js sw.js && python3 sw-rem.py sw.js && node --check sw.js
echo "ОТКАТ: yc serverless function version create --function-id $FID --source-version-id $OLD ; yc storage s3api put-object --bucket $B --key karty.html --body ~/krem/karty-do-rem.html --content-type 'text/html; charset=utf-8' --cache-control no-cache ; yc storage s3api put-object --bucket $B --key sw.js --body ~/krem/sw-do-rem.js --content-type application/javascript --cache-control no-cache ; yc serverless trigger delete eagles-karty-budilnik" > rollback.txt
yc serverless function version get $OLD --format json > old.json
ENVS=$(jq -r '.environment|to_entries|map("\(.key)=\(.value)")|join(",")' old.json)
SECS="$(jq -r '.secrets[]|"--secret environment-variable=\(.environment_variable),id=\(.id),version-id=\(.version_id),key=\(.key)"' old.json | tr '\n' ' ')"
NEW=$(yc serverless function version create --function-id $FID --runtime nodejs22 --entrypoint index.handler \
  --memory 256m --execution-timeout 60s --concurrency 1 --service-account-id $SA --log-folder-id b1gdk9v2q7ufbktofk7o \
  --source-path pkg --environment "$ENVS" $SECS --format json | jq -r .id)
echo "NEW $NEW"
echo "tick снаружи: $(curl -s "https://functions.yandexcloud.net/$FID?type=rem_tick" -X POST)  (ждём error no)"
echo "snooze плохой: $(curl -s "https://functions.yandexcloud.net/$FID?type=rem_snooze&id=1&u=x&k=0" -X POST)  (ждём error bad)"
echo "push_key: $(curl -s "https://functions.yandexcloud.net/$FID?action=push_key" | cut -c1-30)"
yc storage s3api put-object --bucket $B --key karty.html --body karty.html --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
yc storage s3api put-object --bucket $B --key sw.js --body sw.js --content-type application/javascript --cache-control no-cache >/dev/null
echo "site: karty $(curl -s https://$B/karty.html | md5sum | cut -c1-8) (файл $(md5sum < karty.html | cut -c1-8)) sw $(curl -s https://$B/sw.js | md5sum | cut -c1-8) (файл $(md5sum < sw.js | cut -c1-8))"
TSA=$(yc serverless trigger get eagles-storozh-5min --format json | jq -r '.rule.timer.invoke_function_with_retry.service_account_id // .rule.timer.invoke_function.service_account_id')
yc serverless trigger create timer --name eagles-karty-budilnik --cron-expression '* * * * ? *' --payload rem \
  --invoke-function-id $FID --invoke-function-service-account-id $TSA --format json | jq -r '"TRIGGER " + .id + " " + .status'
echo DEPLOY_DONE
