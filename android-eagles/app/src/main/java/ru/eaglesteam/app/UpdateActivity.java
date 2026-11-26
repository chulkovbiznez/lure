package ru.eaglesteam.app;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.core.content.FileProvider;
import java.io.File;

/** EAGLES 1.13: обновление в два нажатия. Сайт открывает eagles://update — приложение само скачивает
 *  новую версию с app.eaglesteam.ru/app/EAGLES.apk и сразу показывает системное окно Android «Обновить».
 *  Совсем без нажатия Android не разрешает (защита от вирусов). */
public class UpdateActivity extends Activity {
  private static final String URL = "https://app.eaglesteam.ru/app/EAGLES.apk";
  private static final String NAME = "EAGLES-update.apk";
  private final Handler h = new Handler(Looper.getMainLooper());
  private long id = -1;
  private boolean askedPerm = false, started = false;
  private TextView txt;
  private ProgressBar bar;

  @Override protected void onCreate(Bundle s) {
    super.onCreate(s);
    LinearLayout box = new LinearLayout(this);
    box.setOrientation(LinearLayout.VERTICAL);
    box.setGravity(Gravity.CENTER);
    box.setBackgroundColor(Color.rgb(7, 7, 8));
    int p = (int) (32 * getResources().getDisplayMetrics().density);
    box.setPadding(p, p, p, p);
    txt = new TextView(this);
    txt.setTextColor(Color.rgb(255, 210, 63));
    txt.setTextSize(18);
    txt.setTypeface(Typeface.DEFAULT_BOLD);
    txt.setGravity(Gravity.CENTER);
    txt.setText("Обновление EAGLES…");
    bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
    bar.setMax(100);
    LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
    lp.topMargin = p / 2;
    box.addView(txt);
    box.addView(bar, lp);
    setContentView(box);
  }

  @Override protected void onResume() {
    super.onResume();
    if (started) return;
    if (Build.VERSION.SDK_INT >= 26 && !getPackageManager().canRequestPackageInstalls()) {
      if (askedPerm) { txt.setText("Чтобы обновить, разреши EAGLES установку приложений и нажми «Обновить» ещё раз."); return; }
      askedPerm = true;
      txt.setText("Разреши EAGLES обновляться: включи переключатель и вернись назад.");
      try {
        startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName())));
      } catch (Exception e) { download(); }
      return;
    }
    download();
  }

  private void download() {
    started = true;
    try {
      File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
      if (dir != null) { File old = new File(dir, NAME); if (old.exists()) old.delete(); }
      DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
      DownloadManager.Request r = new DownloadManager.Request(Uri.parse(URL + "?t=" + System.currentTimeMillis()))
          .setTitle("Обновление EAGLES")
          .setMimeType("application/vnd.android.package-archive")
          .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE)
          .setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, NAME);
      id = dm.enqueue(r);
      txt.setText("Скачиваю новую версию EAGLES…");
      h.postDelayed(this::poll, 400);
    } catch (Exception e) { fallback(); }
  }

  private void poll() {
    try {
      DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
      Cursor c = dm.query(new DownloadManager.Query().setFilterById(id));
      if (c != null && c.moveToFirst()) {
        int st = c.getInt(c.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
        long done = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
        long all = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
        c.close();
        if (all > 0) bar.setProgress((int) (done * 100 / all));
        if (st == DownloadManager.STATUS_SUCCESSFUL) { install(); return; }
        if (st == DownloadManager.STATUS_FAILED) { fallback(); return; }
      } else if (c != null) c.close();
    } catch (Exception e) { fallback(); return; }
    h.postDelayed(this::poll, 400);
  }

  private void install() {
    try {
      File f = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), NAME);
      Uri u = FileProvider.getUriForFile(this, "ru.eaglesteam.app.fileprovider", f);
      Intent i = new Intent(Intent.ACTION_VIEW).setDataAndType(u, "application/vnd.android.package-archive")
          .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
      startActivity(i);
      finish();
    } catch (Exception e) { fallback(); }
  }

  /** Если что-то пошло не так — открываем страницу скачивания, как раньше. */
  private void fallback() {
    try {
      startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://app.eaglesteam.ru/app/")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
    } catch (Exception ignored) { }
    finish();
  }

  @Override protected void onDestroy() { h.removeCallbacksAndMessages(null); super.onDestroy(); }
}
