#!/bin/bash
# Карты v53 (26.11.2026): будильники в приложение (eagles://alarms), нужен APK 1.19. Только karty.html.
set -e
C=$1; [ -n "$C" ] || { echo "нужен коммит"; exit 1; }
mkdir -p ~/k53 && cd ~/k53; B=app.eaglesteam.ru
curl -fsS https://raw.githubusercontent.com/chulkovbiznez/lure/$C/sait-eagles/karty-budilnik/karty-v53.py -o karty-v53.py
curl -fsS https://$B/karty.html -o karty-do-53.html
[ "$(md5sum < karty-do-53.html | cut -c1-8)" = efa63ec9 ] || { echo "STOP: на сайте не тот karty.html"; exit 1; }
cp karty-do-53.html karty.html && python3 karty-v53.py karty.html
echo "ОТКАТ: yc storage s3api put-object --bucket $B --key karty.html --body ~/k53/karty-do-53.html --content-type 'text/html; charset=utf-8' --cache-control no-cache" > rollback.txt
yc storage s3api put-object --bucket $B --key karty.html --body karty.html --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
echo "site: karty $(curl -s https://$B/karty.html | md5sum | cut -c1-8) (файл $(md5sum < karty.html | cut -c1-8))"
echo DEPLOY_DONE
