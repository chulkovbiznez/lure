#!/bin/bash
# Карты v52 (26.11.2026): eagles://alarmoff для приложения 1.18. Только karty.html.
set -e
C=$1; [ -n "$C" ] || { echo "нужен коммит"; exit 1; }
mkdir -p ~/k52 && cd ~/k52; B=app.eaglesteam.ru
curl -fsS https://raw.githubusercontent.com/chulkovbiznez/lure/$C/sait-eagles/karty-budilnik/karty-v52.py -o karty-v52.py
curl -fsS https://$B/karty.html -o karty-do-52.html
[ "$(md5sum < karty-do-52.html | cut -c1-8)" = 5ff5a196 ] || { echo "STOP: на сайте не тот karty.html"; exit 1; }
cp karty-do-52.html karty.html && python3 karty-v52.py karty.html
echo "ОТКАТ: yc storage s3api put-object --bucket $B --key karty.html --body ~/k52/karty-do-52.html --content-type 'text/html; charset=utf-8' --cache-control no-cache" > rollback.txt
yc storage s3api put-object --bucket $B --key karty.html --body karty.html --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
echo "site: karty $(curl -s https://$B/karty.html | md5sum | cut -c1-8) (файл $(md5sum < karty.html | cut -c1-8))"
echo DEPLOY_DONE
