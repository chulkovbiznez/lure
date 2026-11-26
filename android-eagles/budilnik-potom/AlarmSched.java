package ru.eaglesteam.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * 1.19 (26.11.2026): будильники Карт хранятся и звенят в самом телефоне (без пушей, которые при смахнутом приложении опаздывают).
 * Страница Карт при сохранении зовёт eagles://alarms?d=<base64url JSON> — [{"id":"…","t":"текст","at":[ms,…]}], полный список.
 * Каждый срок ставится через AlarmManager.setAlarmClock (точно, будит телефон), после перезагрузки восстанавливается.
 */
public class AlarmSched extends BroadcastReceiver {
  static final String P = "eg_alarms", K_LIST = "list", K_MODE = "local", K_FIRED = "fired";
  static final String A_FIRE = "ru.eaglesteam.app.ALARM_FIRE";

  static SharedPreferences sp(Context c) { return c.getSharedPreferences(P, Context.MODE_PRIVATE); }
  static boolean localMode(Context c) { return sp(c).getBoolean(K_MODE, false); }
  static boolean firedRecently(Context c) { return Math.abs(System.currentTimeMillis() - sp(c).getLong(K_FIRED, 0)) < 2 * 60 * 1000L; }

  static JSONArray load(Context c) {
    try { return new JSONArray(sp(c).getString(K_LIST, "[]")); } catch (Exception e) { return new JSONArray(); }
  }
  static void save(Context c, JSONArray a) { sp(c).edit().putString(K_LIST, a.toString()).apply(); }

  /** Полная замена списка будильников (из страницы Карт). */
  static void setAll(Context c, String json) {
    JSONArray in;
    try { in = new JSONArray(json); } catch (Exception e) { android.util.Log.w("EAGLES", "bad alarms json", e); return; }
    cancelAll(c, load(c));
    long now = System.currentTimeMillis();
    JSONArray out = new JSONArray();
    int n = 0;
    for (int i = 0; i < in.length() && n < 30; i++) {
      JSONObject o = in.optJSONObject(i); if (o == null) continue;
      String id = o.optString("id", ""); if (id.isEmpty()) continue;
      JSONArray at = o.optJSONArray("at"), keep = new JSONArray();
      if (at != null) for (int j = 0; j < at.length() && n < 30; j++) { long t = at.optLong(j, 0); if (t > now) { keep.put(t); n++; } }
      if (keep.length() == 0) continue;
      try { out.put(new JSONObject().put("id", id).put("t", o.optString("t", "")).put("at", keep)); } catch (Exception ignored) { }
    }
    save(c, out);
    sp(c).edit().putBoolean(K_MODE, true).apply();
    scheduleAll(c, out);
  }

  static void scheduleAll(Context c, JSONArray a) {
    long now = System.currentTimeMillis();
    for (int i = 0; i < a.length(); i++) {
      JSONObject o = a.optJSONObject(i); if (o == null) continue;
      JSONArray at = o.optJSONArray("at"); if (at == null) continue;
      for (int j = 0; j < at.length(); j++) { long t = at.optLong(j, 0); if (t > now - 60000) schedule(c, o.optString("id"), o.optString("t"), Math.max(t, now + 1000)); }
    }
  }

  static PendingIntent pi(Context c, String id, String t, long at, boolean create) {
    Intent i = new Intent(c, AlarmSched.class).setAction(A_FIRE)
        .putExtra("id", id).putExtra("t", t).putExtra("at", at);
    int fl = PendingIntent.FLAG_IMMUTABLE | (create ? PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_NO_CREATE);
    return PendingIntent.getBroadcast(c, (id + "|" + at).hashCode(), i, fl);
  }

  static void schedule(Context c, String id, String t, long at) {
    try {
      AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE); if (am == null) return;
      PendingIntent p = pi(c, id, t, at, true);
      if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) { am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p); return; }
      PendingIntent show = PendingIntent.getActivity(c, 7310, AlarmService.kartyIntent(c, false), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
      am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, show), p);
    } catch (Exception e) { android.util.Log.w("EAGLES", "schedule alarm failed", e); }
  }

  static void cancelAll(Context c, JSONArray a) {
    for (int i = 0; i < a.length(); i++) {
      JSONObject o = a.optJSONObject(i); if (o == null) continue;
      JSONArray at = o.optJSONArray("at"); if (at == null) continue;
      for (int j = 0; j < at.length(); j++) cancelOne(c, o.optString("id"), o.optString("t"), at.optLong(j, 0));
    }
  }
  static void cancelOne(Context c, String id, String t, long at) {
    try {
      AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
      PendingIntent p = pi(c, id, t, at, false);
      if (am != null && p != null) { am.cancel(p); p.cancel(); }
    } catch (Exception ignored) { }
  }

  /** Прозвенел срок at — убрать его из списка. */
  static void consumed(Context c, String id, long at) {
    JSONArray a = load(c);
    for (int i = 0; i < a.length(); i++) {
      JSONObject o = a.optJSONObject(i); if (o == null || !id.equals(o.optString("id"))) continue;
      JSONArray old = o.optJSONArray("at"), keep = new JSONArray();
      if (old != null) for (int j = 0; j < old.length(); j++) if (old.optLong(j) != at) keep.put(old.optLong(j));
      try { o.put("at", keep); } catch (Exception ignored) { }
    }
    save(c, a);
  }

  /** «Выключить»: снять оставшиеся повторы этого будильника. */
  static void cancelId(Context c, String id) {
    JSONArray a = load(c), out = new JSONArray();
    for (int i = 0; i < a.length(); i++) {
      JSONObject o = a.optJSONObject(i); if (o == null) continue;
      if (id.equals(o.optString("id"))) { JSONArray one = new JSONArray(); one.put(o); cancelAll(c, one); } else out.put(o);
    }
    save(c, out);
  }

  /** «Отложить 10 мин»: ещё один звонок этого будильника. */
  static void snooze(Context c, String id, String t, long at) {
    JSONArray a = load(c);
    boolean found = false;
    for (int i = 0; i < a.length(); i++) {
      JSONObject o = a.optJSONObject(i); if (o == null || !id.equals(o.optString("id"))) continue;
      JSONArray at0 = o.optJSONArray("at"); if (at0 == null) { at0 = new JSONArray(); try { o.put("at", at0); } catch (Exception ignored) { } }
      at0.put(at); found = true;
    }
    if (!found) { try { a.put(new JSONObject().put("id", id).put("t", t).put("at", new JSONArray().put(at))); } catch (Exception ignored) { } }
    save(c, a);
    schedule(c, id, t, at);
  }

  @Override public void onReceive(Context c, Intent intent) {
    String act = intent != null ? intent.getAction() : null;
    if (A_FIRE.equals(act)) {
      String id = intent.getStringExtra("id"), t = intent.getStringExtra("t");
      long at = intent.getLongExtra("at", 0);
      if (id == null) return;
      consumed(c, id, at);
      sp(c).edit().putLong(K_FIRED, System.currentTimeMillis()).apply();
      String title = t == null || t.isEmpty() ? "⏰ Будильник EAGLES" : (t.startsWith("⏰") ? t : "⏰ " + t);
      AlarmService.fireLocal(c, id, title);
      return;
    }
    // перезагрузка телефона или обновление приложения — ставим будильники заново
    if (Intent.ACTION_BOOT_COMPLETED.equals(act) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(act) || "android.intent.action.LOCKED_BOOT_COMPLETED".equals(act)) {
      scheduleAll(c, load(c));
    }
  }
}
