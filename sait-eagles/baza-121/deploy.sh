#!/bin/bash
# Задание 121: повтор запроса к базе в eagles-server (db() до 3 раз) + текст mail_hour на странице LURE. Секретов не печатает.
set -e
mkdir -p ~/k121 && cd ~/k121
OLD=d4egv7qv00b7qmi3r5nl; FN=eagles-server; SA=ajevbo38i28ud6fae5sk
CUR=$(yc serverless function version get-by-tag --function-id d4e7hbmkhkj14dq3e8ip --tag '$latest' --format json | jq -r .id)
[ "$CUR" = "$OLD" ] || { echo "STOP: живая версия $CUR, а ждали $OLD"; exit 1; }
R=https://raw.githubusercontent.com/chulkovbiznez/lure/$1
mkdir -p pkg; cp ~/k118/pkg/index.js ~/k118/pkg/server.js pkg/
echo "live index.js $(md5sum < pkg/index.js | cut -c1-32) (ждали 3f8b0e6d1acef6d64134c9c42030f931)"
curl -fsS $R/sait-eagles/baza-121/p121.py -o p121.py
python3 p121.py pkg/index.js && node --check pkg/index.js
yc serverless function version get $OLD --format json > old.json
ENVS=$(jq -r '.environment|to_entries|map("\(.key)=\(.value)")|join(",")' old.json)
SECS=$(jq -r '.secrets[]|"--secret environment-variable=\(.environment_variable),id=\(.id),version-id=\(.version_id),key=\(.key)"' old.json | tr '\n' ' ')
echo "ОТКАТ сервера: yc serverless function version create --function-id d4e7hbmkhkj14dq3e8ip --source-version-id $OLD; страницы LURE: yc storage s3 cp ~/k121/lure-do-121.html s3://lure.eaglesteam.ru/index.html" > rollback.txt
yc serverless function version create --function-id d4e7hbmkhkj14dq3e8ip --runtime nodejs22 --entrypoint index.handler \
  --memory 256m --execution-timeout 60s --concurrency 1 --service-account-id $SA --log-folder-id b1gdk9v2q7ufbktofk7o \
  --source-path pkg --environment "$ENVS" $SECS --format json | jq -r '"NEW " + .id + " " + .status'
yc storage s3 cp s3://lure.eaglesteam.ru/index.html lure-do-121.html >/dev/null
echo "lure old $(md5sum < lure-do-121.html | cut -c1-32) (ждали f8005c00cbeadf8ffbf4511c33ccd5ad)"
curl -fsS $R/public/index.html -o lure-121.html
echo "lure new $(md5sum < lure-121.html | cut -c1-32)"
yc storage s3 cp lure-121.html s3://lure.eaglesteam.ru/index.html >/dev/null && echo "up lure"
for i in 1 2 3; do curl -s "https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip?action=login_request&login=99999999"; echo; done
echo DEPLOY_DONE
