#!/bin/bash
# Ставит LURE на ВМ ai-chat рядом с движком New API.
# Запуск (под root, после sudo -i):  bash install-lure.sh https://github.com/ИМЯ/lure.git
# Что делает: скачивает код в /opt/ai-chat/lure, спрашивает ключ движка, добавляет сервис lure
# в docker-compose.yml и адрес lure.eaglesteam.ru в Caddyfile, перезапускает. Сайт EAGLES не трогает.
set -e
REPO="$1"
D=/opt/ai-chat
[ -n "$REPO" ] || { echo "Укажи адрес репозитория: bash install-lure.sh https://github.com/ИМЯ/lure.git"; exit 1; }
[ -f $D/docker-compose.yml ] || { echo "Не нашёл $D/docker-compose.yml"; exit 1; }
command -v git >/dev/null || apt-get install -y git

if [ -d $D/lure/.git ]; then git -C $D/lure pull --ff-only; else git clone --depth 1 "$REPO" $D/lure; fi
mkdir -p $D/lure-data

if [ ! -f $D/lure.env ]; then
  echo
  echo "Вставь ключ движка New API (Токены → твой токен для LURE, начинается с sk-) и нажми Enter."
  echo "Символы на экране не появятся, так и должно быть."
  read -rs KEY; echo
  [ -n "$KEY" ] || { echo "Ключ пустой"; exit 1; }
  umask 077
  printf "NEWAPI_KEY=%s\nOWNER_IDS=11111\nRUB_PER_UNIT=100\nDAY_LIMIT_RUB=1500\nWELCOME_RUB=0\n" "$KEY" > $D/lure.env
fi

cp $D/docker-compose.yml $D/docker-compose.yml.bak-lure
if ! grep -q "^  lure:" $D/docker-compose.yml; then
  python3 - "$D/docker-compose.yml" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
svc='''  lure:
    image: node:22-alpine
    restart: always
    working_dir: /app
    command: node server.js
    env_file: ./lure.env
    environment:
      - TZ=Europe/Moscow
      - DATA_DIR=/data
      - NEWAPI_URL=http://new-api:3000
    volumes:
      - ./lure:/app:ro
      - ./lure-data:/data
    depends_on:
      - new-api
'''
s='\n'+s; i=s.find('\nservices:')
if i==-1: raise SystemExit('no services:')
j=i+len('\nservices:\n')
s=s[:j]+svc+s[j:]
open(p,'w').write(s[1:])
PY
fi

cp $D/Caddyfile $D/Caddyfile.bak-lure
if ! grep -q "lure.eaglesteam.ru" $D/Caddyfile; then
  if [ -f $D/certs/lure/fullchain.pem ]; then
    printf "\nlure.eaglesteam.ru {\n    tls /certs/lure/fullchain.pem /certs/lure/key.pem\n    reverse_proxy lure:8080 {\n        flush_interval -1\n    }\n}\n" >> $D/Caddyfile
  else
    echo "ВНИМАНИЕ: сертификата для lure ещё нет ($D/certs/lure). Адрес lure добавлю после него."
  fi
fi

cd $D && docker compose up -d && docker compose restart caddy
sleep 3
docker compose ps
echo
docker compose logs --tail 20 lure
echo
echo "ГОТОВО. Открой https://lure.eaglesteam.ru"
