#!/bin/bash
# Задание 119: старт в декабре + плашки «Скоро» (Обучение, Канал). Видео не удаляются, только скрыты.
set -e
cd ~/k119
mkdir -p pdo pnew
P="binar contacts obuchenie roliki profile kanal"
for f in $P; do yc storage s3 cp s3://app.eaglesteam.ru/$f.html pdo/$f.html >/dev/null; done
python3 patch119.py pdo pnew
echo "ОТКАТ: for f in $P; do yc storage s3api put-object --bucket app.eaglesteam.ru --key \$f.html --body ~/k119/pdo/\$f.html --content-type 'text/html; charset=utf-8' --cache-control no-cache; done" > rollback.txt
yc storage s3api put-object --bucket app.eaglesteam.ru --key eg-skoro.js --body eg-skoro.js --content-type "application/javascript; charset=utf-8" --cache-control no-cache >/dev/null && echo "up eg-skoro.js $(curl -s https://app.eaglesteam.ru/eg-skoro.js | md5sum | cut -c1-32)"
for f in $P; do yc storage s3api put-object --bucket app.eaglesteam.ru --key $f.html --body pnew/$f.html --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null && echo "up $f $(curl -s https://app.eaglesteam.ru/$f.html | grep -c 'декабр')"; done
echo DEPLOY_DONE
