#!/bin/bash
# Включает «Изображения» и «Видео» LURE на сервере ai-chat.
# Запуск (под root):  bash /opt/ai-chat/lure/tools/media-env.sh <SAVER_URL> <SAVER_KEY>
# Записывает адрес и секрет функции media-saver в lure.env, спрашивает ключ Polza (если его ещё нет),
# перезапускает LURE и проверяет, что Polza и media-saver отвечают.
set -e
D=/opt/ai-chat; E=$D/lure.env
[ -n "$1" ] && [ -n "$2" ] || { echo "Нужно два значения: SAVER_URL SAVER_KEY"; exit 1; }
setv() { grep -v "^$1=" "$E" > "$E.tmp" || true; printf '%s=%s\n' "$1" "$2" >> "$E.tmp"; cat "$E.tmp" > "$E"; rm -f "$E.tmp"; }
setv SAVER_URL "$1"; setv SAVER_KEY "$2"
if ! grep -q '^POLZA_KEY=.' "$E"; then
  echo
  echo "Вставь ключ Polza (polza.ai → API-ключи) и нажми Enter. Символы не появятся, так и должно быть."
  read -rs PK; echo
  [ -n "$PK" ] || { echo "Ключ пустой, ничего не включено. Запусти команду ещё раз."; exit 1; }
  setv POLZA_KEY "$PK"; unset PK
fi
cd $D && docker compose up -d --force-recreate lure >/dev/null && sleep 5
docker compose exec -T lure node -e '
const E=process.env, P=(E.POLZA_URL||"https://d5dlktk1t7njgiu965hg.764nr5vy.apigw.yandexcloud.net/api/v1").replace(/\/$/,"");
(async()=>{
  try{const r=await fetch(P+"/models?type=video",{headers:{Authorization:"Bearer "+E.POLZA_KEY},signal:AbortSignal.timeout(30000)});const j=await r.json();console.log("POLZA:",r.status,"видео-моделей:",(j.data||[]).length)}catch(e){console.log("POLZA: ошибка",e.message)}
  try{const r=await fetch(E.SAVER_URL,{method:"POST",headers:{"Content-Type":"application/json","X-Saver-Key":E.SAVER_KEY},body:JSON.stringify({url:"https://example.com/a.png",key:"t/00000000.png"}),signal:AbortSignal.timeout(30000)});console.log("SAVER:",r.status,(await r.text()).slice(0,80))}catch(e){console.log("SAVER: ошибка",e.message)}
})()'
echo "Ожидается: POLZA: 200 …  и  SAVER: 400 {\"error\":\"bad_host\"} (это значит, что функция на связи и секрет верный)."
echo "ГОТОВО."
