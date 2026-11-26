#!/bin/bash
# 27.11.2026: канал EYRIE открыт всем (eg-skoro.js v3). Откат: ~/kanal0/eg-skoro-do.js
set -e
mkdir -p ~/kanal0 && cd ~/kanal0
curl -s https://app.eaglesteam.ru/eg-skoro.js -o eg-skoro-do.js
echo "was $(md5sum eg-skoro-do.js | cut -c1-32)"
curl -s "https://raw.githubusercontent.com/chulkovbiznez/lure/claude/project-thread-xovz5v/sait-eagles/kanal-s-nulya/eg-skoro.js" -o eg-skoro.js
[ "$(md5sum eg-skoro.js | cut -c1-32)" = "3197e220f95a2aa8cfb94be15beb10a2" ] || { echo BAD_MD5; exit 1; }
echo "ОТКАТ: yc storage s3api put-object --bucket app.eaglesteam.ru --key eg-skoro.js --body ~/kanal0/eg-skoro-do.js --content-type 'application/javascript; charset=utf-8' --cache-control no-cache" > rollback.txt
yc storage s3api put-object --bucket app.eaglesteam.ru --key eg-skoro.js --body eg-skoro.js --content-type "application/javascript; charset=utf-8" --cache-control no-cache >/dev/null
echo "live $(curl -s https://app.eaglesteam.ru/eg-skoro.js | md5sum | cut -c1-32)"
echo DEPLOY_DONE
