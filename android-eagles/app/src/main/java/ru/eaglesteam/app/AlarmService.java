package ru.eaglesteam.app;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;

/**
 * 1.18 (26.11.2026): настоящий будильник Карт. Звук играет по кругу из приложения (не от уведомления),
 * поэтому не глохнет, когда опускают шторку. Плашка висит (ongoing), пока не нажали «Выключить» / «Отложить 10 мин»,
 * не открыли будильник, не выключили его на странице Карт или не прошло 10 минут.
 */
public class AlarmService extends Service {
  static final String CH = "eagles_alarm_v3";
  static final int NID = 7301;
  static final String A_START = "ru.eaglesteam.app.ALARM_START";
  static final String A_STOP = "ru.eaglesteam.app.ALARM_STOP";
  static final long MAX_MS = 10 * 60 * 1000L;

  // данные текущего будильника (тот же процесс, что и EgDelegationService)
  static volatile CharSequence title, text;
  static volatile PendingIntent okPi, snzPi;
  static volatile boolean running;

  private MediaPlayer mp;
  private Vibrator vib;
  private final Handler h = new Handler(Looper.getMainLooper());
  private final Runnable autoOff = new Runnable() { public void run() { stopAlarm(null); } };

  /** Запустить будильник. false — не получилось (тогда показываем обычное звенящее уведомление). */
  static boolean fire(Context c, CharSequence t, CharSequence body, Notification n) {
    title = t; text = body; okPi = null; snzPi = null;
    if (n != null && n.actions != null) {
      for (Notification.Action a : n.actions) {
        String s = a.title == null ? "" : a.title.toString().toLowerCase();
        if (s.contains("отлож")) snzPi = a.actionIntent; else if (okPi == null) okPi = a.actionIntent;
      }
    }
    Intent si = new Intent(c, AlarmService.class).setAction(A_START);
    try {
      if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(si); else c.startService(si);
      return true;
    } catch (Exception e) {
      android.util.Log.w("EAGLES", "alarm direct start failed, trying AlarmManager", e);
    }
    // Android 12+ не даёт запускать службу из фона; будильник AlarmManager даёт на это право
    try {
      if (Build.VERSION.SDK_INT < 26) return false;
      AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
      if (am == null) return false;
      if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) return false;
      PendingIntent pi = PendingIntent.getForegroundService(c, 7302, si, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
      PendingIntent show = PendingIntent.getActivity(c, 7303, kartyIntent(c, false), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
      am.setAlarmClock(new AlarmManager.AlarmClockInfo(System.currentTimeMillis() + 300, show), pi);
      return true;
    } catch (Exception e) {
      android.util.Log.w("EAGLES", "alarm via AlarmManager failed", e);
      return false;
    }
  }

  static void stop(Context c) {
    if (!running) return;
    try { c.startService(new Intent(c, AlarmService.class).setAction(A_STOP)); } catch (Exception e) {
      try { c.stopService(new Intent(c, AlarmService.class)); } catch (Exception ignored) { }
    }
  }

  static Intent kartyIntent(Context c, boolean stopAlarm) {
    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("https://app.eaglesteam.ru/karty.html"))
        .setClass(c, EgLauncherActivity.class)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    if (stopAlarm) i.putExtra("egAlarmStop", true);
    return i;
  }

  @Override public IBinder onBind(Intent intent) { return null; }

  @Override public int onStartCommand(Intent intent, int flags, int startId) {
    String a = intent != null ? intent.getAction() : null;
    if (A_STOP.equals(a)) { stopAlarm(intent.getStringExtra("which")); return START_NOT_STICKY; }
    try {
      Notification n = build();
      if (Build.VERSION.SDK_INT >= 29) startForeground(NID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
      else startForeground(NID, n);
    } catch (Exception e) {
      android.util.Log.w("EAGLES", "alarm startForeground failed", e);
      stopSelf(); return START_NOT_STICKY;
    }
    running = true;
    play();
    h.removeCallbacks(autoOff);
    h.postDelayed(autoOff, MAX_MS);
    return START_NOT_STICKY;
  }

  private Notification build() {
    NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= 26 && nm != null && nm.getNotificationChannel(CH) == null) {
      NotificationChannel ch = new NotificationChannel(CH, "Будильник EAGLES (звенит до выключения)", NotificationManager.IMPORTANCE_HIGH);
      ch.setSound(null, null);          // звук играет сама служба по кругу
      ch.enableVibration(false);        // вибрирует сама служба
      ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
      ch.setBypassDnd(true);
      nm.createNotificationChannel(ch);
    }
    int fl = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
    PendingIntent open = PendingIntent.getActivity(this, 7304, kartyIntent(this, true), fl);
    PendingIntent full = PendingIntent.getActivity(this, 7305, kartyIntent(this, false), fl);
    PendingIntent off = PendingIntent.getService(this, 7306, new Intent(this, AlarmService.class).setAction(A_STOP).putExtra("which", "ok"), fl);
    PendingIntent snz = PendingIntent.getService(this, 7307, new Intent(this, AlarmService.class).setAction(A_STOP).putExtra("which", "snz"), fl);
    Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CH) : new Notification.Builder(this);
    b.setSmallIcon(R.drawable.ic_notify)
        .setContentTitle(title != null ? title : "⏰ Будильник EAGLES")
        .setContentText(text != null ? text : "Нажми «Выключить»")
        .setContentIntent(open)
        .setFullScreenIntent(full, true)
        .setOngoing(true)
        .setAutoCancel(false)
        .setCategory(Notification.CATEGORY_ALARM)
        .setPriority(Notification.PRIORITY_MAX)
        .setVisibility(Notification.VISIBILITY_PUBLIC)
        .addAction(new Notification.Action.Builder(null, "Отложить 10 мин", snz).build())
        .addAction(new Notification.Action.Builder(null, "Выключить", off).build());
    if (Build.VERSION.SDK_INT >= 31) b.setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE);
    return b.build();
  }

  private void play() {
    try {
      if (mp == null) {
        mp = new MediaPlayer();
        mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
        AssetFileDescriptor afd = getResources().openRawResourceFd(R.raw.eagles_rem);
        mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
        afd.close();
        mp.setLooping(true);
        mp.prepare();
      }
      if (!mp.isPlaying()) mp.start();
    } catch (Exception e) { android.util.Log.w("EAGLES", "alarm sound failed", e); }
    try {
      if (vib == null) vib = (Vibrator) getSystemService(VIBRATOR_SERVICE);
      if (vib != null && Build.VERSION.SDK_INT >= 26) vib.vibrate(VibrationEffect.createWaveform(new long[] {0, 400, 200, 400, 900}, 0));
    } catch (Exception ignored) { }
  }

  private void stopAlarm(String which) {
    PendingIntent p = "snz".equals(which) ? snzPi : "ok".equals(which) ? okPi : null;
    if (p != null) { try { p.send(); } catch (Exception ignored) { } }   // сайт узнаёт «Готово» / «Отложить» (sw.js)
    if ("snz".equals(which) && p == null) android.util.Log.w("EAGLES", "no snooze action from site");
    h.removeCallbacks(autoOff);
    release();
    running = false;
    try { if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE); else stopForeground(true); } catch (Exception ignored) { }
    stopSelf();
  }

  private void release() {
    if (mp != null) { try { mp.stop(); } catch (Exception ignored) { } try { mp.release(); } catch (Exception ignored) { } mp = null; }
    if (vib != null) { try { vib.cancel(); } catch (Exception ignored) { } }
  }

  @Override public void onDestroy() { h.removeCallbacks(autoOff); release(); running = false; super.onDestroy(); }
}
