#!/bin/bash
# Задание 122 (25.11.2026): уведомления на телефон + PWA-файлы + строка в страницах + приложение 1.1. Секретов не печатает.
set -e
C=$1; [ -n "$C" ] || { echo "нужен коммит"; exit 1; }
mkdir -p ~/k122 && cd ~/k122
FID=d4e7hbmkhkj14dq3e8ip; OLD=d4e0tpmcb1s7bfgler2e; SA=ajevbo38i28ud6fae5sk; B=app.eaglesteam.ru
CUR=$(yc serverless function version get-by-tag --function-id $FID --tag '$latest' --format json | jq -r .id)
[ "$CUR" = "$OLD" ] || { echo "STOP: живая версия $CUR, а ждали $OLD"; exit 1; }
[ -f ~/k121/pkg/index.js ] || { echo "STOP: нет ~/k121/pkg"; exit 1; }
rm -rf pkg && mkdir pkg && cp ~/k121/pkg/index.js ~/k121/pkg/server.js pkg/
I5=$(md5sum < pkg/index.js | cut -c1-32); S5=$(md5sum < pkg/server.js | cut -c1-32)
echo "live index $I5 (ждали a54dfd93a46e53cc43dfffaf51a53ae8) server $S5 (ждали 2756ceb6ae67c2a67501f0872ac9ade7)"
[ "$I5" = a54dfd93a46e53cc43dfffaf51a53ae8 ] && [ "$S5" = 2756ceb6ae67c2a67501f0872ac9ade7 ] || { echo "STOP: код не тот"; exit 1; }
R=https://raw.githubusercontent.com/chulkovbiznez/lure/$C/sait-eagles/push-122
curl -fsS $R/p122.py -o p122.py; curl -fsS $R/webpush.js -o webpush.js
python3 p122.py pkg/index.js pkg/server.js webpush.js && node --check pkg/index.js
# ключи VAPID: закрытый — в Lockbox eagles-push-vapid (создаётся один раз), открытый — в переменной функции
SID=$(yc lockbox secret get --folder-id b1gdk9v2q7ufbktofk7o --name eagles-push-vapid --format json 2>/dev/null | jq -r .id || true)
if [ -z "$SID" ] || [ "$SID" = null ]; then
  node -e "const c=require('crypto');const k=c.generateKeyPairSync('ec',{namedCurve:'P-256'}).privateKey.export({format:'jwk'});require('fs').writeFileSync('vk.json',JSON.stringify([{key:'VAPID_PRIVATE',text_value:k.d}]));require('fs').writeFileSync('vapid.pub',Buffer.concat([Buffer.from([4]),Buffer.from(k.x,'base64url'),Buffer.from(k.y,'base64url')]).toString('base64url'))"
  SID=$(yc lockbox secret create --folder-id b1gdk9v2q7ufbktofk7o --name eagles-push-vapid --description "EAGLES push VAPID private key (задание 122)" --payload "$(cat vk.json)" --format json | jq -r .id)
  rm -f vk.json
  yc lockbox secret add-access-binding --id $SID --role lockbox.payloadViewer --service-account-id $SA >/dev/null
fi
[ -s vapid.pub ] || { echo "STOP: нет vapid.pub (секрет уже был, а открытого ключа нет)"; exit 1; }
VPUB=$(cat vapid.pub); VID=$(yc lockbox secret get --id $SID --format json | jq -r .current_version.id)
echo "VAPID public ${VPUB:0:12}… secret $SID version $VID"
yc serverless function version get $OLD --format json > old.json
ENVS=$(jq -r '.environment|to_entries|map("\(.key)=\(.value)")|join(",")' old.json),VAPID_PUBLIC=$VPUB
SECS="$(jq -r '.secrets[]|"--secret environment-variable=\(.environment_variable),id=\(.id),version-id=\(.version_id),key=\(.key)"' old.json | tr '\n' ' ') --secret environment-variable=VAPID_PRIVATE,id=$SID,version-id=$VID,key=VAPID_PRIVATE"
mkdir -p pages-do site
echo "ОТКАТ сервера: yc serverless function version create --function-id $FID --source-version-id $OLD ; страницы: for f in ~/k122/pages-do/*.html; do yc storage s3api put-object --bucket $B --key \$(basename \$f) --body \$f --content-type 'text/html; charset=utf-8' --cache-control no-cache; done ; приложение 1.0: ~/k122/EAGLES-1.0.apk" > rollback.txt
yc serverless function version create --function-id $FID --runtime nodejs22 --entrypoint index.handler \
  --memory 256m --execution-timeout 60s --concurrency 1 --service-account-id $SA --log-folder-id b1gdk9v2q7ufbktofk7o \
  --source-path pkg --environment "$ENVS" $SECS --format json | jq -r '"NEW " + .id + " " + .status'
for i in 1 2 3; do curl -s "https://functions.yandexcloud.net/$FID?action=login_request&login=99999999"; echo; done
curl -s "https://functions.yandexcloud.net/$FID?action=push_key"; echo
# файлы приложения на сайт
for f in sw.js manifest.webmanifest egpwa/pwa.js egpwa/offline.html egpwa/icon-192.png egpwa/icon-512.png egpwa/icon-maskable-192.png egpwa/icon-maskable-512.png egpwa/apple-touch-icon.png egpwa/favicon-48.png app/index.html app/EAGLES.apk; do
  mkdir -p site/$(dirname $f); curl -fsS $R/site/$f -o site/$f
done
yc storage s3 cp s3://$B/app/EAGLES.apk EAGLES-1.0.apk >/dev/null
ct(){ case $1 in *.js) echo application/javascript;; *.webmanifest) echo application/manifest+json;; *.html) echo "text/html; charset=utf-8";; *.png) echo image/png;; *.apk) echo application/vnd.android.package-archive;; esac; }
for f in sw.js manifest.webmanifest egpwa/pwa.js egpwa/offline.html app/index.html; do yc storage s3api put-object --bucket $B --key $f --body site/$f --content-type "$(ct $f)" --cache-control no-cache >/dev/null; done
for f in egpwa/icon-192.png egpwa/icon-512.png egpwa/icon-maskable-192.png egpwa/icon-maskable-512.png egpwa/apple-touch-icon.png egpwa/favicon-48.png; do yc storage s3api put-object --bucket $B --key $f --body site/$f --content-type image/png --cache-control max-age=86400 >/dev/null; done
yc storage s3api put-object --bucket $B --key app/EAGLES.apk --body site/app/EAGLES.apk --content-type application/vnd.android.package-archive --content-disposition 'attachment; filename="EAGLES.apk"' --cache-control no-cache >/dev/null
echo "files up: sw $(curl -s https://$B/sw.js | md5sum | cut -c1-8) pwa $(curl -s https://$B/egpwa/pwa.js | md5sum | cut -c1-8) apk $(curl -s https://$B/app/EAGLES.apk | md5sum | cut -c1-8)"
# строка в страницах (все .html в корне, кроме v.html — страница кандидата)
LINE='<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/png" href="/egpwa/favicon-48.png"><link rel="apple-touch-icon" href="/egpwa/apple-touch-icon.png"><script src="/egpwa/pwa.js" defer></script>'
N=0; SK=""
for k in $(yc storage s3 ls s3://$B/ | awk '{print $NF}' | grep -E '^[a-z0-9_-]+\.html$'); do
  [ "$k" = v.html ] && continue
  yc storage s3 cp s3://$B/$k pages-do/$k >/dev/null
  if grep -q 'egpwa/pwa.js' pages-do/$k; then SK="$SK $k(уже)"; continue; fi
  C1=$(grep -c '<meta charset="utf-8">' pages-do/$k || true)
  if [ "$C1" != 1 ]; then SK="$SK $k(нет-якоря)"; continue; fi
  python3 -c "import sys;p,o=sys.argv[1],sys.argv[2];s=open(p,encoding='utf8').read();open(o,'w',encoding='utf8').write(s.replace('<meta charset=\"utf-8\">','<meta charset=\"utf-8\">'+sys.argv[3],1))" pages-do/$k site/$k "$LINE"
  yc storage s3api put-object --bucket $B --key $k --body site/$k --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null && N=$((N+1))
done
echo "pages patched $N; skipped:$SK"
echo "profile has line: $(curl -s https://$B/profile.html | grep -c egpwa/pwa.js)"
echo DEPLOY_DONE
