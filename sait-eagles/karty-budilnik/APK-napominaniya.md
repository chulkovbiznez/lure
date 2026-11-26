# Будильник Карт — правка приложения (для треда приложения EAGLES)

Файл звука: `sait-eagles/karty-budilnik/eagles_rem.ogg` → положить в `android-eagles/app/src/main/res/raw/eagles_rem.ogg`
(звук Андрея из ElevenLabs, обрезан до 2,7 с, +7 дБ, без клиппинга по лимитеру).

В `EgDelegationService.onNotifyNotificationWithChannel`, ПЕРЕД веткой «Сообщения EAGLES» (после проверки «📞»):

```java
        if (t != null && t.toString().startsWith("⏰") && nm.areNotificationsEnabled()) {
          if (nm.getNotificationChannel(REM_CH) == null) {
            NotificationChannel ch = new NotificationChannel(REM_CH, "Напоминания EAGLES", NotificationManager.IMPORTANCE_HIGH);
            Uri snd = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.eagles_rem);
            ch.setSound(snd, new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
            ch.enableVibration(true);
            ch.setVibrationPattern(new long[] {0, 400, 200, 400, 200, 400});
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
          }
          Notification.Builder b = Notification.Builder.recoverBuilder(this, notification); // кнопки «Отложить 10 мин» / «Готово» из sw.js сохраняются
          b.setChannelId(REM_CH).setCategory(Notification.CATEGORY_REMINDER);
          b.setSmallIcon(R.drawable.ic_notify);
          nm.notify(platformTag, platformId, b.build());
          return true;
        }
```
и константу `static final String REM_CH = "eagles_rem_v1";`

USAGE_ALARM — чтобы звенело и при беззвучном «Не беспокоить» с разрешёнными будильниками. Если звучит слишком настойчиво — USAGE_NOTIFICATION.
Проверить: что кнопки действий из веб-уведомления (actions) после recoverBuilder по-прежнему доходят до sw.js (notificationclick с e.action).
