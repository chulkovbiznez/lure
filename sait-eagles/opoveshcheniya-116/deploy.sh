#!/bin/bash
# Задание 116: оповещения Андрею в MAX (новый партнёр, оплата, недоплата, оплата без человека).
# Запуск в Cloud Shell из папки с index.js и server.js. Ничего секретного не печатает.
set -e
OLD=d4e4naeq3j27p846o7f0          # текущая версия eagles-server (откат)
FN=eagles-server
SA=ajevbo38i28ud6fae5sk
read MS MV < ~/storozh/secmax.txt # секрет storozh-max
node --check index.js && node --check server.js
yc serverless function version get $OLD --format json > old.json
ENVS=$(jq -r '.environment|to_entries|map("\(.key)=\(.value)")|join(",")' old.json)
SECS=$(jq -r '.secrets[]|"--secret environment-variable=\(.environment_variable),id=\(.id),version-id=\(.version_id),key=\(.key)"' old.json | tr '\n' ' ')
yc lockbox secret add-access-binding --id $MS --role lockbox.payloadViewer --subject serviceAccount:$SA >/dev/null 2>&1 || true
echo "ROLLBACK: yc serverless function version create --function-name $FN --source-version-id $OLD --runtime nodejs22 --entrypoint index.handler --memory 256m --execution-timeout 60s --concurrency 1 --service-account-id $SA --log-folder-id b1gdk9v2q7ufbktofk7o --environment <env из old.json> $SECS" > rollback.txt
mkdir -p pkg && cp index.js server.js pkg/
yc serverless function version create --function-name $FN --runtime nodejs22 --entrypoint index.handler \
  --memory 256m --execution-timeout 60s --concurrency 1 --service-account-id $SA --log-folder-id b1gdk9v2q7ufbktofk7o \
  --source-path pkg --environment "$ENVS,MAX_USER=6008233" $SECS \
  --secret environment-variable=MAX_TOKEN,id=$MS,version-id=$MV,key=MAX_TOKEN --format json | jq -r '"NEW " + .id + " " + .status'
