#!/bin/bash
# 27.11.2026 Витрина до старта, часть 1: сервер (регистрация закрыта, изменения только 11111–11114) + eg-gost.js + pwa.js + eg-kontent.js v7 + eg-skoro.js v4.
# Секретов не печатает. Откат: ~/kgost/rollback.txt
set -e
mkdir -p ~/kgost && cd ~/kgost
BR=claude/project-thread-t6vobs; R=https://raw.githubusercontent.com/chulkovbiznez/lure/$BR/sait-eagles/gost-rezhim
FID=d4e7hbmkhkj14dq3e8ip; OLD=d4e0tpmcb1s7bfgler2e; SA=ajevbo38i28ud6fae5sk; B=app.eaglesteam.ru
CUR=$(yc serverless function version get-by-tag --function-id $FID --tag '$latest' --format json | jq -r .id)
[ "$CUR" = "$OLD" ] || { echo "STOP: живая версия $CUR, а ждали $OLD"; exit 1; }
[ -f ~/k121/pkg/server.js ] || { echo "STOP: нет ~/k121/pkg"; exit 1; }
[ "$(md5sum < ~/k121/pkg/server.js | cut -c1-32)" = "2756ceb6ae67c2a67501f0872ac9ade7" ] || { echo "STOP: server.js не тот"; exit 1; }
# --- проверка страниц до замены
chk(){ curl -s "https://$B/$1?nc=$RANDOM" -o "do-$(basename $1)"; M=$(md5sum < "do-$(basename $1)" | cut -c1-32); [ "$M" = "$2" ] || { echo "STOP: $1 на сайте $M, ждали $2"; exit 1; }; echo "ok was $1"; }
chk egpwa/pwa.js 2c75dd704c1646acd32e9b7e0d7931b1
chk eg-kontent.js a2781ce948c119d9f405f74c4fdf4c9c
chk eg-skoro.js 3197e220f95a2aa8cfb94be15beb10a2
# --- скачать новое
for f in p-gost.py eg-gost.js pwa.js eg-kontent.js eg-skoro.js; do curl -fsS "$R/$f?nc=$RANDOM" -o new-$f; done
echo "new md5: $(md5sum new-eg-gost.js new-pwa.js new-eg-kontent.js new-eg-skoro.js | cut -c1-8 | tr '\n' ' ')"
# --- сервер
rm -rf pkg && mkdir pkg && cp ~/k121/pkg/index.js ~/k121/pkg/server.js pkg/
python3 new-p-gost.py pkg/server.js && node --check pkg/server.js
yc serverless function version get $OLD --format json > old.json
ENVS=$(jq -r '.environment|to_entries|map("\(.key)=\(.value)")|join(",")' old.json)
SECS=$(jq -r '.secrets[]|"--secret environment-variable=\(.environment_variable),id=\(.id),version-id=\(.version_id),key=\(.key)"' old.json | tr '\n' ' ')
cat > rollback.txt <<RB
ОТКАТ сервера: yc serverless function version create --function-id $FID --source-version-id $OLD
ОТКАТ страниц:
yc storage s3api put-object --bucket $B --key egpwa/pwa.js --body ~/kgost/do-pwa.js --content-type 'application/javascript; charset=utf-8' --cache-control no-cache
yc storage s3api put-object --bucket $B --key eg-kontent.js --body ~/kgost/do-eg-kontent.js --content-type 'application/javascript; charset=utf-8' --cache-control no-cache
yc storage s3api put-object --bucket $B --key eg-skoro.js --body ~/kgost/do-eg-skoro.js --content-type 'application/javascript; charset=utf-8' --cache-control no-cache
RB
yc serverless function version create --function-id $FID --runtime nodejs22 --entrypoint index.handler \
  --memory 256m --execution-timeout 60s --concurrency 1 --service-account-id $SA --log-folder-id b1gdk9v2q7ufbktofk7o \
  --source-path pkg --environment "$ENVS" $SECS --format json | jq -r '"NEW " + .id + " " + .status'
# --- страницы (eg-gost.js первым, pwa.js последним)
up(){ yc storage s3api put-object --bucket $B --key "$1" --body "$2" --content-type 'application/javascript; charset=utf-8' --cache-control no-cache >/dev/null && echo "up $1 $(curl -s "https://$B/$1?nc=$RANDOM" | md5sum | cut -c1-8)"; }
up eg-gost.js new-eg-gost.js
up eg-kontent.js new-eg-kontent.js
up eg-skoro.js new-eg-skoro.js
up egpwa/pwa.js new-pwa.js
# --- проверка сервера
sleep 3
echo "reg_request: $(curl -s "https://functions.yandexcloud.net/$FID?action=reg_request")"
echo "chat_send без входа: $(curl -s "https://functions.yandexcloud.net/$FID?action=chat_send")"
echo "kc_list: $(curl -s "https://functions.yandexcloud.net/$FID?action=kc_list&place=uroki" | cut -c1-60)"
echo DEPLOY_DONE
