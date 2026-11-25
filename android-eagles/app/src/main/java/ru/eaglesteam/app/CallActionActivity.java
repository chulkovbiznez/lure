package ru.eaglesteam.app;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

/** EAGLES 1.2: кнопки «Принять» / «Сбросить» в уведомлении о звонке EYE. Убирает уведомление (звук стихает)
 *  и открывает EAGLES на /chat.html?to=ID&eyeans=ID (или eyedecl=ID) — eye.js сам принимает или сбрасывает звонок. */
public class CallActionActivity extends Activity {
  @Override protected void onCreate(Bundle s) {
    super.onCreate(s);
    Intent in = getIntent();
    try {
      String a = in.getStringExtra("a"), tag = in.getStringExtra("tag"), caller = in.getStringExtra("caller");
      int id = in.getIntExtra("id", 0);
      NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
      if (nm != null) nm.cancel(tag, id);
      if (caller != null && caller.matches("\\d{1,12}")) {
        String q = "ans".equals(a) ? "eyeans" : "eyedecl";
        Intent v = new Intent(Intent.ACTION_VIEW, Uri.parse("https://app.eaglesteam.ru/chat.html?to=" + caller + "&" + q + "=" + caller));
        v.setComponent(new ComponentName(this, "com.google.androidbrowserhelper.trusted.LauncherActivity"));
        v.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(v);
      }
    } catch (Exception ignored) { }
    finish();
  }
}
