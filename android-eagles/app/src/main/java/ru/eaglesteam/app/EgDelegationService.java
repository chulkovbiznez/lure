package ru.eaglesteam.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import com.google.androidbrowserhelper.trusted.DelegationService;
import java.util.Locale;

/** EAGLES 1.2: уведомления сайта сразу со звуком, вибрацией и ПОВЕРХ экрана.
 *  Библиотека сама создаёт категорию (например «Общие») с обычной важностью — тогда Samsung не показывает всплывающее окно.
 *  Мы создаём эту категорию заранее с высокой важностью; библиотека потом её не меняет. На уже созданную категорию не влияет. */
public class EgDelegationService extends DelegationService {
  @Override
  public boolean onNotifyNotificationWithChannel(String platformTag, int platformId, Notification notification, String channelName) {
    if (Build.VERSION.SDK_INT >= 26 && channelName != null) {
      try {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        String id = channelName.toLowerCase(Locale.ROOT).replace(' ', '_') + "_channel_id";
        if (nm != null && nm.getNotificationChannel(id) == null) {
          NotificationChannel ch = new NotificationChannel(id, channelName, NotificationManager.IMPORTANCE_HIGH);
          ch.enableVibration(true);
          ch.setVibrationPattern(new long[] {0, 250, 150, 250});
          ch.setShowBadge(true);
          nm.createNotificationChannel(ch);
        }
      } catch (Exception ignored) { }
    }
    return super.onNotifyNotificationWithChannel(platformTag, platformId, notification, channelName);
  }
}
