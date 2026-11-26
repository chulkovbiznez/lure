#!/bin/bash
# Задание 141б: звук колокольчика короче, 2 раза. Только profile.html.
set -e
C=$1; [ -n "$C" ] || { echo "нужен коммит"; exit 1; }
mkdir -p ~/k141b && cd ~/k141b; B=app.eaglesteam.ru
R=https://raw.githubusercontent.com/chulkovbiznez/lure/$C/sait-eagles/kolokolchik-zvuk-141
for f in p-bell141b.py zvonok-korotkij.mp3; do curl -fsS $R/$f -o $f; done
curl -fsS https://$B/profile.html -o profile-do-141b.html
[ "$(md5sum < profile-do-141b.html | cut -c1-8)" = 72ed289b ] || { echo "STOP: на сайте не тот profile.html"; exit 1; }
cp profile-do-141b.html profile.html && python3 p-bell141b.py profile.html zvonok-korotkij.mp3
echo "ОТКАТ: yc storage s3api put-object --bucket $B --key profile.html --body ~/k141b/profile-do-141b.html --content-type 'text/html; charset=utf-8' --cache-control no-cache" > rollback.txt
yc storage s3api put-object --bucket $B --key profile.html --body profile.html --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
echo "site: profile $(curl -s https://$B/profile.html | md5sum | cut -c1-8) (файл $(md5sum < profile.html | cut -c1-8))"
echo DEPLOY_DONE
