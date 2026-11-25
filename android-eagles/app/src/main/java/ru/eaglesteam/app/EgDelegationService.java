package ru.eaglesteam.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
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
  static final String CALL_CH = "eye_calls_v1";
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
        if (channelName != null) {
          String id = channelName.toLowerCase(Locale.ROOT).replace(' ', '_') + "_channel_id";
          if (nm.getNotificationChannel(id) == null) {
            NotificationChannel ch = new NotificationChannel(id, channelName, NotificationManager.IMPORTANCE_HIGH);
            ch.enableVibration(true);
            ch.setVibrationPattern(new long[] {0, 250, 150, 250});
            ch.setShowBadge(true);
            nm.createNotificationChannel(ch);
          }
        }
      } catch (Exception ignored) { }
    }
    return super.onNotifyNotificationWithChannel(platformTag, platformId, notification, channelName);
  }

  private boolean postCall(NotificationManager nm, String tag, int id, Notification n) {
    if (nm.getNotificationChannel(CALL_CH) == null) {
      NotificationChannel ch = new NotificationChannel(CALL_CH, "Звонки EYE", NotificationManager.IMPORTANCE_HIGH);
      Uri ring = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
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

  private PendingIntent act(String a, String tag, int id, String caller, int rq) {
    Intent i = new Intent(this, CallActionActivity.class)
        .setAction("ru.eaglesteam.app.CALL_" + a)
        .putExtra("a", a).putExtra("tag", tag).putExtra("id", id).putExtra("caller", caller)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
    return PendingIntent.getActivity(this, (caller.hashCode() * 4) + rq, i, fl);
  }
}
