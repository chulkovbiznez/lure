package ru.eaglesteam.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/** 1.19: свой экран будильника EAGLES поверх всего (и на заблокированном телефоне). Звук играет AlarmService. */
public class AlarmActivity extends Activity {
  static final int GOLD = 0xFFFFD23F;
  private final Handler h = new Handler(Looper.getMainLooper());
  private TextView clock;
  private final long t0 = System.currentTimeMillis();
  private final Runnable tick = new Runnable() { public void run() {
    if (!AlarmService.running && System.currentTimeMillis() - t0 > 2500) { finish(); return; }
    if (clock != null) clock.setText(new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date()));
    h.postDelayed(this, 500);
  } };

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
    getWindow().setStatusBarColor(Color.BLACK);
    getWindow().setNavigationBarColor(Color.BLACK);
    float d = getResources().getDisplayMetrics().density;

    LinearLayout root = new LinearLayout(this);
    root.setOrientation(LinearLayout.VERTICAL);
    root.setGravity(Gravity.CENTER_HORIZONTAL);
    root.setBackgroundColor(Color.BLACK);
    root.setPadding((int) (24 * d), (int) (56 * d), (int) (24 * d), (int) (32 * d));

    ImageView logo = new ImageView(this);
    logo.setImageResource(R.mipmap.ic_launcher);
    root.addView(logo, new LinearLayout.LayoutParams((int) (96 * d), (int) (96 * d)));

    TextView brand = text("EAGLES · БУДИЛЬНИК", 13, GOLD, true);
    brand.setLetterSpacing(0.25f);
    brand.setPadding(0, (int) (14 * d), 0, 0);
    root.addView(brand);

    clock = text("", 84, Color.WHITE, true);
    clock.setPadding(0, (int) (28 * d), 0, 0);
    root.addView(clock);

    CharSequence t = AlarmService.title;
    String s = t == null ? "" : t.toString().replaceFirst("^⏰\\s*", "");
    TextView msg = text(s.isEmpty() ? "Будильник EAGLES" : s, 22, GOLD, true);
    msg.setPadding(0, (int) (12 * d), 0, 0);
    root.addView(msg);

    View sp = new View(this);
    root.addView(sp, new LinearLayout.LayoutParams(1, 0, 1f));

    root.addView(button("Выключить", true, d, v -> stop("ok")), btnLp(d));
    root.addView(button("Отложить 10 мин", false, d, v -> stop("snz")), btnLp(d));

    TextView open = text("Открыть Карты", 14, 0xFFA29B90, false);
    open.setPadding(0, (int) (18 * d), 0, 0);
    open.setOnClickListener(v -> { startActivity(AlarmService.kartyIntent(this, true)); finish(); });
    root.addView(open);

    setContentView(root);
  }

  private TextView text(String s, int sp, int color, boolean bold) {
    TextView v = new TextView(this);
    v.setText(s); v.setTextSize(sp); v.setTextColor(color); v.setGravity(Gravity.CENTER);
    if (bold) v.setTypeface(Typeface.DEFAULT_BOLD);
    return v;
  }
  private Button button(String s, boolean main, float d, View.OnClickListener l) {
    Button bt = new Button(this);
    bt.setText(s); bt.setAllCaps(false); bt.setTextSize(19); bt.setTypeface(Typeface.DEFAULT_BOLD);
    GradientDrawable g = new GradientDrawable();
    g.setCornerRadius(20 * d);
    if (main) { g.setColor(GOLD); bt.setTextColor(Color.BLACK); }
    else { g.setColor(0xFF1D1A17); g.setStroke((int) (1.5f * d), GOLD); bt.setTextColor(GOLD); }
    bt.setBackground(g);
    bt.setOnClickListener(l);
    return bt;
  }
  private LinearLayout.LayoutParams btnLp(float d) {
    LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int) (64 * d));
    lp.topMargin = (int) (12 * d);
    return lp;
  }
  private void stop(String which) {
    try { startService(new Intent(this, AlarmService.class).setAction(AlarmService.A_STOP).putExtra("which", which)); } catch (Exception ignored) { }
    finish();
  }

  @Override protected void onResume() { super.onResume(); h.removeCallbacks(tick); h.post(tick); }
  @Override protected void onPause() { super.onPause(); h.removeCallbacks(tick); }
  @Override public void onBackPressed() { /* назад не выключает будильник */ moveTaskToBack(true); }
}
