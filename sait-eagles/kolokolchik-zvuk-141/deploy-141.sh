#!/bin/bash
# Задание 141 (26.11.2026): новый звук колокольчика в Профиле. Только profile.html.
set -e
C=$1; [ -n "$C" ] || { echo "нужен коммит"; exit 1; }
mkdir -p ~/k141 && cd ~/k141; B=app.eaglesteam.ru
R=https://raw.githubusercontent.com/chulkovbiznez/lure/$C/sait-eagles/kolokolchik-zvuk-141
for f in p-bell141.py zvonok-novyj.mp3; do curl -fsS $R/$f -o $f; done
curl -fsS https://$B/profile.html -o profile-do-141.html
[ "$(md5sum < profile-do-141.html | cut -c1-8)" = 00a4c6e2 ] || { echo "STOP: на сайте не тот profile.html"; exit 1; }
cp profile-do-141.html profile.html && python3 p-bell141.py profile.html zvonok-novyj.mp3
echo "ОТКАТ: yc storage s3api put-object --bucket $B --key profile.html --body ~/k141/profile-do-141.html --content-type 'text/html; charset=utf-8' --cache-control no-cache" > rollback.txt
yc storage s3api put-object --bucket $B --key profile.html --body profile.html --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
echo "site: profile $(curl -s https://$B/profile.html | md5sum | cut -c1-8) (файл $(md5sum < profile.html | cut -c1-8))"
echo DEPLOY_DONE
