#!/bin/bash
# Ставит LURE на ВМ ai-chat рядом с движком New API.
# Запуск (под root, после sudo -i):  bash install-lure.sh https://github.com/ИМЯ/lure.git
# Что делает: скачивает код в /opt/ai-chat/lure, спрашивает ключ движка, добавляет сервис lure
# в docker-compose.yml и вход /lure-gw для функции-шлюза в Caddyfile, перезапускает. Сайт EAGLES не трогает.
set -e
REPO="$1"
D=/opt/ai-chat
[ -n "$REPO" ] || { echo "Укажи адрес репозитория: bash install-lure.sh https://github.com/ИМЯ/lure.git  (или --key, чтобы вписать ключ)"; exit 1; }
[ -f $D/docker-compose.yml ] || { echo "Не нашёл $D/docker-compose.yml"; exit 1; }
command -v git >/dev/null || apt-get install -y git

if [ "$REPO" = "--auto-key" ]; then
  # Сам создаёт в New API токен LURE и вписывает ключ. Работает и вечером при белых списках.
  git -C $D/lure fetch --depth 1 origin main && git -C $D/lure reset --hard FETCH_HEAD
  cd $D
  docker compose up -d lure >/dev/null
  echo
  echo "Логин администратора New API (тот, с которым входишь на ai.eaglesteam.ru), затем Enter:"
  read -r NU
  echo "Пароль от New API, затем Enter (символы не появятся, так и должно быть):"
  read -rs NP; echo
  OUT=$(printf '%s\n%s\n' "$NU" "$NP" | docker compose exec -T lure node tools/newapi-key.js || true)
  unset NP
  KEY=$(printf '%s\n' "$OUT" | sed -n 's/^KEY //p' | tail -1)
  if [ -z "$KEY" ]; then echo "Не получилось: $(printf '%s\n' "$OUT" | sed -n 's/^ERR //p' | tail -1)"; exit 1; fi
  if grep -q "^NEWAPI_KEY=" $D/lure.env; then sed -i "s|^NEWAPI_KEY=.*|NEWAPI_KEY=$KEY|" $D/lure.env; else echo "NEWAPI_KEY=$KEY" >> $D/lure.env; fi
  unset KEY
  docker compose up -d --force-recreate lure >/dev/null
  sleep 3
  echo "ГОТОВО. Токен LURE создан, ключ вписан, LURE перезапущен."
  exit 0
fi

if [ "$REPO" != "--key" ]; then
  if [ -d $D/lure/.git ]; then git -C $D/lure fetch --depth 1 origin main && git -C $D/lure reset --hard FETCH_HEAD; else git clone --depth 1 "$REPO" $D/lure; fi
fi
mkdir -p $D/lure-data

ask_key() {
  echo
  echo "Вставь ключ движка New API (Токены → токен LURE, начинается с sk-) и нажми Enter."
  echo "Символы на экране не появятся, так и должно быть. Если ключа ещё нет — просто нажми Enter."
  read -rs KEY; echo
}
if [ "$REPO" = "--key" ]; then
  ask_key; [ -n "$KEY" ] || { echo "Ключ пустой"; exit 1; }
  sed -i "s|^NEWAPI_KEY=.*|NEWAPI_KEY=$KEY|" $D/lure.env
  cd $D && docker compose up -d --force-recreate lure && echo "Ключ записан, LURE перезапущен."
  exit 0
fi
if [ ! -f $D/lure.env ]; then
  ask_key
  [ -n "$KEY" ] || echo "Ключа нет: LURE встанет, но отвечать начнёт после команды  bash install-lure.sh --key"
  umask 077
  printf "NEWAPI_KEY=%s\nOWNER_IDS=11111\nRUB_PER_UNIT=100\nDAY_LIMIT_RUB=1500\nWELCOME_RUB=0\n" "$KEY" > $D/lure.env
  umask 022
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
# Вход для функции-шлюза Яндекса: https://ai.eaglesteam.ru/lure-gw/... → сервис lure
if ! grep -q "lure-gw" $D/Caddyfile; then
  python3 - "$D/Caddyfile" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
old='    reverse_proxy new-api:3000\n'
if s.count(old)!=1: raise SystemExit('Caddyfile: не нашёл строку reverse_proxy new-api:3000')
s=s.replace(old,"""    handle /lure-gw/* {
        uri strip_prefix /lure-gw
        reverse_proxy lure:8080
    }
    handle {
        reverse_proxy new-api:3000
    }
""")
open(p,'w').write(s)
PY
fi

cd $D && docker compose up -d && docker compose restart caddy
sleep 3
docker compose ps
echo
docker compose logs --tail 20 lure
echo
echo -n "Проверка шлюза: "; curl -sk --resolve ai.eaglesteam.ru:443:127.0.0.1 https://ai.eaglesteam.ru/lure-gw/api/me; echo
echo "ГОТОВО. Сервер LURE работает. Дальше: хранилище и функция в Yandex Cloud."
