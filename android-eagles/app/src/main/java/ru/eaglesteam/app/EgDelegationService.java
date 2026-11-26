package ru.eaglesteam.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import com.google.androidbrowserhelper.trusted.DelegationService;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** EAGLES 1.2.
 *  1) Уведомления сайта сразу со звуком и ПОВЕРХ экрана: категорию (например «Общие») создаём заранее с высокой важностью.
 *  2) Звонок EYE (заголовок начинается с 📞): своя категория «Звонки EYE» с мелодией звонка, звук идёт по кругу (до ответа,
 *     до «Пропущенный звонок» или 50 с), кнопки «Сбросить» и «Принять». */
public class EgDelegationService extends DelegationService {
  static final String CALL_CH = "eye_calls_v2"; // 1.11: своя мелодия EYE (res/raw/eye_ring.ogg); звук канала менять нельзя, поэтому новый id
  static final String MSG_CH = "eagles_msgs_v2";
  static final String REM_CH = "eagles_rem_v2";  // 1.17: v2 — новый канал, v1 удаляется   // 1.15: будильник Карт (тред «Сделать напоминания-будильник в Картах»)
  private static final Pattern CALLER = Pattern.compile("call-(\\d{1,12})");

  @Override
  public boolean onNotifyNotificationWithChannel(String platformTag, int platformId, Notification notification, String channelName) {
    NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= 26 && nm != null) {
      try {
        CharSequence t = notification.extras != null ? notification.extras.getCharSequence(Notification.EXTRA_TITLE) : null;
        if (t != null && t.toString().startsWith("📞") && nm.areNotificationsEnabled()) {
          return postCall(nm, platformTag, platformId, notification);
        }
        boolean isRem = (t != null && t.toString().contains("⏰")) || (platformTag != null && platformTag.contains("rem-"));   // 1.17: и по tag rem-…
        if (isRem && nm.areNotificationsEnabled()) {
          // 1.18: настоящий будильник — служба играет звук по кругу, плашка висит до «Выключить»
          if (AlarmService.fire(this, t, notification.extras.getCharSequence(Notification.EXTRA_TEXT), notification)) return true;
          // не получилось запустить службу — как в 1.17: звенящее уведомление
          if (nm.getNotificationChannel(REM_CH) == null) {
            try { nm.deleteNotificationChannel("eagles_rem_v1"); } catch (Exception ignored) { }
            NotificationChannel ch = new NotificationChannel(REM_CH, "Будильник EAGLES", NotificationManager.IMPORTANCE_HIGH);
            Uri snd = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.eagles_rem);
            ch.setSound(snd, new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
            ch.enableVibration(true);
            ch.setVibrationPattern(new long[] {0, 400, 200, 400, 200, 400});
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
          }
          // 1.17: уведомление собираем заново (как звонок): в копии Chrome-уведомления звук глушился (без звука при свёрнутом приложении)
          Notification.Builder b = new Notification.Builder(this, REM_CH)
              .setSmallIcon(R.drawable.ic_notify)
              .setContentTitle(t != null ? t : "⏰ Будильник EAGLES")
              .setContentText(notification.extras.getCharSequence(Notification.EXTRA_TEXT))
              .setContentIntent(notification.contentIntent)
              .setDeleteIntent(notification.deleteIntent)
              .setCategory(Notification.CATEGORY_ALARM)
              .setOnlyAlertOnce(false)
              .setGroupAlertBehavior(Notification.GROUP_ALERT_ALL)
              .setAutoCancel(true).setTimeoutAfter(10 * 60 * 1000L).setVisibility(Notification.VISIBILITY_PUBLIC);
          if (notification.getLargeIcon() != null) b.setLargeIcon(notification.getLargeIcon());
          if (notification.actions != null) for (Notification.Action a : notification.actions) b.addAction(a);   // «Отложить 10 мин» / «Готово» из sw.js
          try {
            Intent fs = new Intent(Intent.ACTION_VIEW, Uri.parse("https://app.eaglesteam.ru/karty.html"))
                .setClass(this, EgLauncherActivity.class)   // без egCallId: открытие Карт не глушит будильник, глушит нажатие/смахивание
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            b.setFullScreenIntent(PendingIntent.getActivity(this, 777000 + (platformId & 0xfff), fs,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE), true);
          } catch (Exception eF) {}
          Notification out = b.build();
          out.flags |= Notification.FLAG_INSISTENT;
          nm.notify(platformTag, platformId, out);
          return true;
        }
        // 1.9: свой канал «Сообщения EAGLES» с высокой важностью — уведомление всплывает поверх экрана.
        // Старый канал (создан ещё в 1.1 Chrome-библиотекой с обычной важностью) поднять нельзя,
        // поэтому перекладываем уведомление в новый канал сами.
        if (nm.areNotificationsEnabled()) {
          if (nm.getNotificationChannel(MSG_CH) == null) {
            NotificationChannel ch = new NotificationChannel(MSG_CH, "Сообщения EAGLES", NotificationManager.IMPORTANCE_HIGH);
            ch.enableVibration(true);
            ch.setVibrationPattern(new long[] {0, 250, 150, 250});
            ch.setShowBadge(true);
            ch.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
            nm.createNotificationChannel(ch);
          }
          Notification.Builder b = Notification.Builder.recoverBuilder(this, notification);
          b.setChannelId(MSG_CH);
          b.setSmallIcon(R.drawable.ic_notify);
          b.setOnlyAlertOnce(false).setGroupAlertBehavior(Notification.GROUP_ALERT_ALL);   // 1.17: звук и всплытие и при свёрнутом приложении
          nm.notify(platformTag, platformId, b.build());
          return true;
        }
      } catch (Exception eN) { android.util.Log.w("EAGLES", "notify branch failed", eN); }
    }
    return super.onNotifyNotificationWithChannel(platformTag, platformId, notification, channelName);
  }

  // 1.18: страница Карт закрыла уведомление будильника (кнопка «Выключить» на сайте) — глушим звук
  @Override
  public void onCancelNotification(String platformTag, int platformId) {
    try { if (platformTag != null && platformTag.contains("rem-")) AlarmService.stop(this); } catch (Exception ignored) { }
    super.onCancelNotification(platformTag, platformId);
  }

  private boolean postCall(NotificationManager nm, String tag, int id, Notification n) {
    if (nm.getNotificationChannel(CALL_CH) == null) {
      try { nm.deleteNotificationChannel("eye_calls_v1"); } catch (Exception ignored) { }
      NotificationChannel ch = new NotificationChannel(CALL_CH, "Звонки EYE", NotificationManager.IMPORTANCE_HIGH);
      Uri ring = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.eye_ring);
      ch.setSound(ring, new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
      ch.enableVibration(true);
      ch.setVibrationPattern(new long[] {0, 800, 600, 800, 600, 800});
      ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
      nm.createNotificationChannel(ch);
    }
    Notification.Builder b = Notification.Builder.recoverBuilder(this, n)
        .setChannelId(CALL_CH).setCategory(Notification.CATEGORY_CALL).setTimeoutAfter(50000)
        .setVisibility(Notification.VISIBILITY_PUBLIC).setAutoCancel(true);
    Matcher m = CALLER.matcher(tag == null ? "" : tag);
    String caller = null;
    while (m.find()) caller = m.group(1);
    if (caller != null && Build.VERSION.SDK_INT >= 31) {
      // 1.12: настоящие кнопки звонка Android — круглые зелёная и красная трубки (CallStyle).
      try {
        CharSequence t = n.extras != null ? n.extras.getCharSequence(Notification.EXTRA_TITLE) : null;
        String name = t == null ? "EYE" : t.toString().replace("📞", "").trim();
        if (name.isEmpty()) name = "EYE";
        android.app.Person who = new android.app.Person.Builder().setName(name).setImportant(true).build();
        Notification.Builder cb = Notification.Builder.recoverBuilder(this, n)
            .setChannelId(CALL_CH).setCategory(Notification.CATEGORY_CALL).setTimeoutAfter(50000)
            .setVisibility(Notification.VISIBILITY_PUBLIC).setAutoCancel(true).setActions();
        cb.setStyle(Notification.CallStyle.forIncomingCall(who, act("decl", tag, id, caller, 1), act("ans", tag, id, caller, 2)));
        Intent fs = new Intent(Intent.ACTION_VIEW, Uri.parse("https://app.eaglesteam.ru/chat.html?to=" + caller))
            .setClass(this, EgLauncherActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        cb.setFullScreenIntent(PendingIntent.getActivity(this, caller.hashCode() * 4 + 3, fs,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE), true);
        Notification out = cb.build();
        out.flags |= Notification.FLAG_INSISTENT;
        nm.notify(tag, id, out);
        if (posted(nm, tag, id)) return true;
      } catch (Exception ignored) { }
    }
    if (caller != null) {
      b.setActions();
      b.addAction(new Notification.Action.Builder(null, "❌ Сбросить", act("decl", tag, id, caller, 1)).build());
      b.addAction(new Notification.Action.Builder(null, "✅ Принять", act("ans", tag, id, caller, 2)).build());
    }
    Notification out = b.build();
    out.flags |= Notification.FLAG_INSISTENT;
    nm.notify(tag, id, out);
    return true;
  }

  /** Система могла молча отклонить уведомление о звонке — тогда покажем запасной вариант с обычными кнопками. */
  private static boolean posted(NotificationManager nm, String tag, int id) {
    try {
      for (android.service.notification.StatusBarNotification sb : nm.getActiveNotifications()) {
        if (sb.getId() == id && (tag == null ? sb.getTag() == null : tag.equals(sb.getTag()))) return true;
      }
    } catch (Exception ignored) { }
    return false;
  }

  /** 1.14: кнопка звонка сразу открывает EAGLES на /chat.html?to=ID&eyeans=ID (или eyedecl=ID), без промежуточного экрана —
   *  на Samsung с кнопками CallStyle промежуточный экран не запускал приложение. Уведомление гасит EgLauncherActivity. */
  private PendingIntent act(String a, String tag, int id, String caller, int rq) {
    String q = "ans".equals(a) ? "eyeans" : "eyedecl";
    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("https://app.eaglesteam.ru/chat.html?to=" + caller + "&" + q + "=" + caller))
        .setClass(this, EgLauncherActivity.class)
        .putExtra("egCallTag", tag).putExtra("egCallId", id)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
    return PendingIntent.getActivity(this, (caller.hashCode() * 4) + rq, i, fl);
  }
}
