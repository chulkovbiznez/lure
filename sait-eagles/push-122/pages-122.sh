#!/bin/bash
# Задание 122, шаг «строка в страницах» (все .html в корне бакета, кроме v.html). Копии до — ~/k122/pages-do/
set -e
cd ~/k122; B=app.eaglesteam.ru; mkdir -p pages-do site
LINE='<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/png" href="/egpwa/favicon-48.png"><link rel="apple-touch-icon" href="/egpwa/apple-touch-icon.png"><script src="/egpwa/pwa.js" defer></script>'
KEYS=$(yc storage s3api list-objects --bucket $B --delimiter / --format json | jq -r '.. | objects | .key? // empty' | grep -E '^[a-z0-9_-]+\.html$' | sort -u)
echo "pages: $(echo $KEYS | wc -w)"
N=0; SK=""
for k in $KEYS; do
  [ "$k" = v.html ] && continue
  yc storage s3 cp s3://$B/$k pages-do/$k >/dev/null
  if grep -q 'egpwa/pwa.js' pages-do/$k; then SK="$SK $k(уже)"; continue; fi
  C1=$(grep -c '<meta charset="utf-8">' pages-do/$k || true)
  if [ "$C1" != 1 ]; then SK="$SK $k(якорь=$C1)"; continue; fi
  python3 -c "import sys;p,o=sys.argv[1],sys.argv[2];s=open(p,encoding='utf8').read();open(o,'w',encoding='utf8').write(s.replace('<meta charset=\"utf-8\">','<meta charset=\"utf-8\">'+sys.argv[3],1))" pages-do/$k site/$k "$LINE"
  yc storage s3api put-object --bucket $B --key $k --body site/$k --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null && N=$((N+1))
done
echo "pages patched $N; skipped:$SK"
echo "profile has line: $(curl -s https://$B/profile.html | grep -c egpwa/pwa.js)"
echo PAGES_DONE
