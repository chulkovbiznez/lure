#!/bin/bash
# 27.11.2026 «Один пакет PRO 499 ₽»: сервер (PKGS: только PRO 499, 25 % / 20 %, потолок 100 000) + 15 страниц сайта. Секретов не печатает.
set -e
mkdir -p ~/k499 && cd ~/k499
BR=claude/project-thread-zrhknm; R=https://raw.githubusercontent.com/chulkovbiznez/lure/$BR/sait-eagles/pro-499
FID=d4e7hbmkhkj14dq3e8ip; OLD=d4e07p79tbcv9p5d65v3; B=app.eaglesteam.ru
CUR=$(yc serverless function version get-by-tag --function-id $FID --tag '$latest' --format json | jq -r .id)
[ "$CUR" = "$OLD" ] || { echo "STOP: живая версия $CUR, а ждали $OLD"; exit 1; }
PK=~/kgost/pkg
[ -f $PK/server.js ] || { echo "STOP: нет $PK"; exit 1; }
chk(){ curl -s "https://$B/$1?nc=$RANDOM" -o "do-$1"; M=$(md5sum < "do-$1" | cut -c1-32); [ "$M" = "$2" ] || { echo "STOP: $1 на сайте $M, ждали $2"; exit 1; }; }
chk marketing.html 8c787aca35898fbf8961dc13355f7ce6
chk profile.html 28d84ae01248efc3048e1ea257c3a623
chk index.html 6377e7fe77d8c6eee74f93d399d13ea9
chk binar.html 178259933bfa6a8318f1d945733fb64f
chk oferta.html e4b1a714a6e0a47369299f6d494dbc5d
chk vyplaty.html ea8ab0517cca3d124c1a7815903585f4
chk faq.html 855d4f150e79d904f75130774e3258d4
chk dokumenty.html 81cab269aff82b1b4dc962bf4fe09be9
chk rassylki.html 42eab40dfd2ed2956a965248644de72a
chk reklama.html a6fac8126c1cda28428d74de3699d3cc
chk soglashenie.html ca6b7ca7c214fbe686f4a42b8662c9c3
chk partner.html e39c5ed3db0708365a1b596fe47b694c
chk politika.html 53fba81a362491d729b33b2820e7a93f
chk soglasie.html 07299756d0d8a17cfa369859e834e1db
chk kodeks.html 5e14bed5bb919f7d1e230abf9670a3ba
echo "страницы на сайте = ожидаемые"
for f in p499_server.py new/marketing.html new/profile.html new/index.html new/binar.html new/oferta.html new/vyplaty.html new/faq.html new/dokumenty.html new/rassylki.html new/reklama.html new/soglashenie.html new/partner.html new/politika.html new/soglasie.html new/kodeks.html ; do mkdir -p $(dirname $f); curl -fsS "$R/$f?nc=$RANDOM" -o "$f"; done
[ "$(md5sum < new/marketing.html | cut -c1-32)" = "960e237d6d2d2cf6c64f50c7bc2fa432" ] || { echo 'STOP: скачалось не то: marketing'; exit 1; }
[ "$(md5sum < new/profile.html | cut -c1-32)" = "3879589cc13f89656f86b25f08110b4f" ] || { echo 'STOP: скачалось не то: profile'; exit 1; }
[ "$(md5sum < new/index.html | cut -c1-32)" = "4dcf50c385426de58076fb957ed933e8" ] || { echo 'STOP: скачалось не то: index'; exit 1; }
[ "$(md5sum < new/binar.html | cut -c1-32)" = "9ca80d6bc4118e87a47fbc59484a8deb" ] || { echo 'STOP: скачалось не то: binar'; exit 1; }
[ "$(md5sum < new/oferta.html | cut -c1-32)" = "7d833967ba3be8a982909b96172cb78c" ] || { echo 'STOP: скачалось не то: oferta'; exit 1; }
[ "$(md5sum < new/vyplaty.html | cut -c1-32)" = "4fafbafb1e680be17b9fccde3c224537" ] || { echo 'STOP: скачалось не то: vyplaty'; exit 1; }
[ "$(md5sum < new/faq.html | cut -c1-32)" = "b6e963876095e66bd0a38bc03230943a" ] || { echo 'STOP: скачалось не то: faq'; exit 1; }
[ "$(md5sum < new/dokumenty.html | cut -c1-32)" = "74908639b64ec23e4a4204b9b0d7abfa" ] || { echo 'STOP: скачалось не то: dokumenty'; exit 1; }
[ "$(md5sum < new/rassylki.html | cut -c1-32)" = "71373e14a86a8bb13f739cea995c6324" ] || { echo 'STOP: скачалось не то: rassylki'; exit 1; }
[ "$(md5sum < new/reklama.html | cut -c1-32)" = "8ea7d3a5d3176b7b06cc360faf45da6c" ] || { echo 'STOP: скачалось не то: reklama'; exit 1; }
[ "$(md5sum < new/soglashenie.html | cut -c1-32)" = "b699801e39b089229809889f6b5fc417" ] || { echo 'STOP: скачалось не то: soglashenie'; exit 1; }
[ "$(md5sum < new/partner.html | cut -c1-32)" = "0260fd7a1b8ad32fab09c6acc1180166" ] || { echo 'STOP: скачалось не то: partner'; exit 1; }
[ "$(md5sum < new/politika.html | cut -c1-32)" = "912e2a7f1a468c2a69273797288debea" ] || { echo 'STOP: скачалось не то: politika'; exit 1; }
[ "$(md5sum < new/soglasie.html | cut -c1-32)" = "af5ff98db0dfa4da72ee71522b087004" ] || { echo 'STOP: скачалось не то: soglasie'; exit 1; }
[ "$(md5sum < new/kodeks.html | cut -c1-32)" = "905825e1a3d88cb2f352edbac77b1281" ] || { echo 'STOP: скачалось не то: kodeks'; exit 1; }
rm -rf pkg && mkdir pkg && cp -r $PK/. pkg/
python3 p499_server.py pkg/server.js && node --check pkg/server.js
grep -n "E1:  { price" pkg/server.js
yc serverless function version get $OLD --format json > old.json
ENVS=$(jq -r '.environment|to_entries|map("\(.key)=\(.value)")|join(",")' old.json)
SECS=$(jq -r '.secrets[]|"--secret environment-variable=\(.environment_variable),id=\(.id),version-id=\(.version_id),key=\(.key)"' old.json | tr '\n' ' ')
MEM=$(( $(jq -r .resources.memory old.json) / 1048576 ))m; TO=$(jq -r .execution_timeout old.json); CC=$(jq -r '.concurrency // 1' old.json); SA=$(jq -r .service_account_id old.json); RT=$(jq -r .runtime old.json); EP=$(jq -r .entrypoint old.json)
echo "ОТКАТ сервера: yc serverless function version create --function-id $FID --source-version-id $OLD ; страницы: ~/k499/do-*.html" > rollback.txt
yc serverless function version create --function-id $FID --runtime $RT --entrypoint $EP \
  --memory $MEM --execution-timeout $TO --concurrency $CC --service-account-id $SA --log-folder-id b1gdk9v2q7ufbktofk7o \
  --source-path pkg --environment "$ENVS" $SECS --format json | jq -r '"NEW " + .id + " " + .status'
for f in new/*.html; do k=$(basename $f); yc storage s3api put-object --bucket $B --key "$k" --body "$f" --content-type 'text/html; charset=utf-8' --cache-control no-cache >/dev/null; [ "$(curl -s "https://$B/$k?nc=$RANDOM" | md5sum | cut -c1-32)" = "$(md5sum < $f | cut -c1-32)" ] && echo "up $k ok" || echo "up $k MISMATCH"; done
sleep 3
echo "bin_plan: $(curl -s "https://functions.yandexcloud.net/$FID?action=kc_list&place=uroki" | cut -c1-40)"
echo DEPLOY_DONE
