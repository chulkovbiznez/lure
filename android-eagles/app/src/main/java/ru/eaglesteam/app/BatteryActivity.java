package ru.eaglesteam.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;

/** EAGLES 1.2: eagles://battery — просит Android не усыплять приложение (иначе звонки EYE не доходят).
 *  eagles://notif — открывает настройки уведомлений EAGLES (звук, всплывающие). Сразу закрывается. */
public class BatteryActivity extends Activity {
  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    Uri d = getIntent() != null ? getIntent().getData() : null;
    String host = d != null && d.getHost() != null ? d.getHost() : "battery";
    try {
      if ("alarms".equals(host)) {   // 1.19: список будильников Карт от страницы
        String q = d.getQueryParameter("d");
        if (q != null) AlarmSched.setAll(this, new String(android.util.Base64.decode(q, android.util.Base64.URL_SAFE | android.util.Base64.NO_WRAP | android.util.Base64.NO_PADDING), java.nio.charset.StandardCharsets.UTF_8));
        finish(); return;
      }
      if ("alarmoff".equals(host)) { AlarmService.stop(this); finish(); return; }   // 1.18: кнопка «Выключить» на странице Карт
      if ("notif".equals(host)) {
        Intent i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
        i.putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName());
        if (Build.VERSION.SDK_INT < 26) i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()));
        startActivity(i);
      } else if (Build.VERSION.SDK_INT >= 23) {
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
          try {
            startActivity(new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getPackageName())));
          } catch (Exception e) {
            startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
          }
        }
      }
    } catch (Exception ignored) { }
    finish();
  }
}
