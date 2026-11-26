package ru.eaglesteam.app;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;

/**
 * 1.20: невидимая «ссылка» для страницы Карт: eagles://alarms?d=… и eagles://alarmoff.
 * Живёт в СВОЕЙ задаче (taskAffinity=""), поэтому не трогает задачу приложения и не перезапускает его с профиля
 * (в 1.19 ссылка шла через BatteryActivity в задачу EAGLES, и Android сбрасывал её на профиль).
 */
public class LinkActivity extends Activity {
  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    try {
      Uri d = getIntent() != null ? getIntent().getData() : null;
      String host = d != null ? d.getHost() : null;
      if ("alarms".equals(host)) {
        String q = d.getQueryParameter("d");
        if (q != null) AlarmSched.setAll(this, new String(android.util.Base64.decode(q,
            android.util.Base64.URL_SAFE | android.util.Base64.NO_WRAP | android.util.Base64.NO_PADDING), java.nio.charset.StandardCharsets.UTF_8));
      } else if ("alarmoff".equals(host)) {
        AlarmService.stop(this);
      }
    } catch (Exception e) { android.util.Log.w("EAGLES", "link failed", e); }
    finish();
    overridePendingTransition(0, 0);
  }
}
