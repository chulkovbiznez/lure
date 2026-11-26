package ru.eaglesteam.app;

import android.content.ComponentName;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import androidx.browser.customtabs.CustomTabColorSchemeParams;
import androidx.browser.trusted.TrustedWebActivityIntentBuilder;
import androidx.browser.customtabs.TrustedWebUtils;
import androidx.browser.trusted.splashscreens.SplashScreenParamKey;
import androidx.browser.trusted.splashscreens.SplashScreenVersion;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.widget.ImageView;

import androidx.annotation.Nullable;
import androidx.browser.customtabs.CustomTabsCallback;
import androidx.browser.customtabs.CustomTabsClient;
import androidx.browser.customtabs.CustomTabsService;
import androidx.browser.customtabs.CustomTabsServiceConnection;
import androidx.browser.customtabs.CustomTabsSession;

import com.google.androidbrowserhelper.trusted.LauncherActivity;
import com.google.androidbrowserhelper.trusted.TwaProviderPicker;

/**
 * 1.3 (26.11.2026): при запуске сначала показываем заставку EAGLES и просим Chrome заранее
 * проверить связь сайт↔приложение (validateRelationship). Когда Chrome ответил (или через 4 с),
 * открываем приложение. Так Chrome открывается уже проверенным: без серого окна со ссылкой,
 * и заставка передаётся в Chrome до первой отрисовки страницы.
 * 1.6: заставка с золотым переливом по логотипу (ShineSplashView).
 * 1.7: открываем Chrome ТОЙ ЖЕ сессией, которая уже проверила связь сайт↔приложение,
 * и сами передаём ему заставку. Цель — убрать короткое серое окно Chrome с полоской сверху.
 * Если что-то не получилось — старый путь launchTwa() из библиотеки.
 */
public class EgLauncherActivity extends LauncherActivity {
    private static final Uri ORIGIN = Uri.parse("https://app.eaglesteam.ru");
    private static final Uri START = Uri.parse("https://app.eaglesteam.ru/profile.html?app=android&v=21&ac=18");
    private static final long MAX_WAIT_MS = 4000;

    private final Handler mHandler = new Handler(Looper.getMainLooper());
    private CustomTabsServiceConnection mConn;
    private boolean mLaunched;
    private static final String AUTH = "ru.eaglesteam.app.fileprovider";
    private CustomTabsSession mSession;
    private String mProvider;
    private boolean mVerified, mSplashDone, mSplashOk;
    private boolean mOwnLaunch;

    @Override
    protected boolean shouldLaunchImmediately() {
        return false;
    }

    @Override
    protected ImageView.ScaleType getSplashImageScaleType() {
        return ImageView.ScaleType.CENTER_CROP;
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        // 1.14: кнопки «Ответить»/«Отклонить» звонка EYE открывают нас напрямую — гасим уведомление (мелодия стихает)
        try {
            Intent in = getIntent();
            if (in != null && in.hasExtra("egCallId")) {
                android.app.NotificationManager nm = (android.app.NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                if (nm != null) nm.cancel(in.getStringExtra("egCallTag"), in.getIntExtra("egCallId", 0));
            }
        } catch (Throwable ignored) { }
        super.onCreate(savedInstanceState);
        if (isFinishing()) return;
        showSplash();
        mHandler.postDelayed(this::go, MAX_WAIT_MS);
        try {
            TwaProviderPicker.Action action = TwaProviderPicker.pickProvider(getPackageManager());
            String provider = action.provider;
            mProvider = provider;
            if (provider == null) { go(); return; }
            mConn = new CustomTabsServiceConnection() {
                @Override
                public void onCustomTabsServiceConnected(ComponentName name, CustomTabsClient client) {
                    try {
                        client.warmup(0);
                        CustomTabsSession session = client.newSession(new CustomTabsCallback() {
                            @Override
                            public void onRelationshipValidationResult(int relation, Uri origin,
                                    boolean result, @Nullable Bundle extras) {
                                mHandler.post(() -> { mVerified = result; tryOwnLaunch(); });
                            }
                        });
                        mSession = session;
                        if (session != null) transferSplash(session, provider);
                        if (session != null) {
                            try { session.mayLaunchUrl(START, null, null); } catch (Throwable ignored) { }
                        }
                        if (session == null || !session.validateRelationship(
                                CustomTabsService.RELATION_HANDLE_ALL_URLS, ORIGIN, null)) {
                            mHandler.post(EgLauncherActivity.this::go);
                        }
                    } catch (Throwable t) {
                        mHandler.post(EgLauncherActivity.this::go);
                    }
                }

                @Override
                public void onServiceDisconnected(ComponentName name) { }
            };
            if (!CustomTabsClient.bindCustomTabsService(this, provider, mConn)) {
                mConn = null;
                go();
            }
        } catch (Throwable t) {
            go();
        }
    }

    private void showSplash() {
        try {
            setContentView(new ShineSplashView(this));
        } catch (Throwable t) {
            try {
                ImageView v = new ImageView(this);
                v.setImageResource(R.drawable.splash);
                v.setScaleType(ImageView.ScaleType.CENTER_CROP);
                v.setBackgroundColor(Color.rgb(7, 7, 8));
                setContentView(v);
            } catch (Throwable ignored) { }
        }
    }

    /** Заставку сохраняем в файл и передаём Chrome через нашу сессию (в фоне). */
    private void transferSplash(CustomTabsSession session, String provider) {
        new Thread(() -> {
            boolean ok = false;
            try {
                if (TrustedWebUtils.areSplashScreensSupported(this, provider, SplashScreenVersion.V1)) {
                    File dir = new File(getFilesDir(), "twa_splash");
                    if (!dir.exists()) dir.mkdirs();
                    File f = new File(dir, "splash_image.png");
                    BitmapFactory.Options o = new BitmapFactory.Options();
                    o.inScaled = false;
                    Bitmap b = BitmapFactory.decodeResource(getResources(), R.drawable.splash, o);
                    try (OutputStream os = new FileOutputStream(f)) {
                        b.compress(Bitmap.CompressFormat.PNG, 100, os);
                        os.flush();
                    }
                    try {
                        grantUriPermission(getPackageName(), FileProvider.getUriForFile(this, AUTH, f),
                                Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
                    } catch (Throwable ignored) { }
                    ok = TrustedWebUtils.transferSplashImage(this, f, AUTH, provider, session);
                }
            } catch (Throwable ignored) { }
            final boolean res = ok;
            mHandler.post(() -> { mSplashOk = res; mSplashDone = true; tryOwnLaunch(); });
        }).start();
    }

    /** Матрица для заставки в Chrome: CENTER_CROP в области между строкой состояния и кнопками. */
    @Nullable
    private float[] chromeMatrix() {
        try {
            if (Build.VERSION.SDK_INT < 23) return null;
            android.view.WindowInsets in = getWindow().getDecorView().getRootWindowInsets();
            if (in == null) return null;
            android.util.DisplayMetrics dm = new android.util.DisplayMetrics();
            getWindowManager().getDefaultDisplay().getRealMetrics(dm);
            BitmapFactory.Options o = new BitmapFactory.Options();
            o.inScaled = false;
            o.inJustDecodeBounds = true;
            BitmapFactory.decodeResource(getResources(), R.drawable.splash, o);
            float iw = o.outWidth, ih = o.outHeight, W = dm.widthPixels, H = dm.heightPixels;
            if (iw <= 0 || ih <= 0 || W <= 0 || H <= 0) return null;
            float top = in.getSystemWindowInsetTop(), bot = H - in.getSystemWindowInsetBottom();
            float ah = bot - top;
            if (ah < H * 0.6f) return null;
            float sc = Math.max(W / iw, ah / ih);
            float tx = (W - iw * sc) / 2f, ty = top + (ah - ih * sc) / 2f;
            return new float[] {sc, 0, tx, 0, sc, ty, 0, 0, 1};
        } catch (Throwable t) {
            return null;
        }
    }

    /** Когда связь проверена и заставка передана — открываем Chrome своей сессией. */
    private void tryOwnLaunch() {
        if (mLaunched || isFinishing()) return;
        if (!mVerified || mSession == null) { go(); return; }
        if (!mSplashDone) return;
        mLaunched = true;
        mHandler.removeCallbacksAndMessages(null);
        try {
            int bg = Color.rgb(7, 7, 8);
            TrustedWebActivityIntentBuilder b = new TrustedWebActivityIntentBuilder(getLaunchingUrl())
                    .setDefaultColorSchemeParams(new CustomTabColorSchemeParams.Builder()
                            .setToolbarColor(bg).setNavigationBarColor(bg).build());
            if (mSplashOk) {
                Bundle sp = new Bundle();
                sp.putString(SplashScreenParamKey.KEY_VERSION, SplashScreenVersion.V1);
                sp.putInt(SplashScreenParamKey.KEY_FADE_OUT_DURATION_MS, 300);
                sp.putInt(SplashScreenParamKey.KEY_BACKGROUND_COLOR, bg);
                float[] mx = chromeMatrix();
                if (mx != null) {
                    // 1.10: Chrome рисует заставку на ВЕСЬ экран (под полосками), а сайт — между полосками.
                    // Передаём точную матрицу: картинка встаёт туда же, где потом будет экран загрузки сайта.
                    sp.putInt(SplashScreenParamKey.KEY_SCALE_TYPE, ImageView.ScaleType.MATRIX.ordinal());
                    sp.putFloatArray(SplashScreenParamKey.KEY_IMAGE_TRANSFORMATION_MATRIX, mx);
                } else {
                    sp.putInt(SplashScreenParamKey.KEY_SCALE_TYPE, ImageView.ScaleType.CENTER_CROP.ordinal());
                }
                b.setSplashScreenParams(sp);
            }
            try {
                new com.google.androidbrowserhelper.trusted.SharedPreferencesTokenStore(this)
                        .store(androidx.browser.trusted.Token.create(mProvider, getPackageManager()));
            } catch (Throwable ignored) { }
            androidx.browser.trusted.TrustedWebActivityIntent twa = b.build(mSession);
            try { com.google.androidbrowserhelper.trusted.FocusActivity.addToIntent(twa.getIntent(), this); } catch (Throwable ignored) { }
            twa.launchTrustedWebActivity(this);
            mOwnLaunch = true;
            overridePendingTransition(0, 0);
            finish();
        } catch (Throwable t) {
            mLaunched = false;
            go();
        }
    }

    private void go() {
        if (mLaunched || isFinishing()) return;
        mLaunched = true;
        mHandler.removeCallbacksAndMessages(null);
        launchTwa();
    }

    @Override
    protected void onDestroy() {
        mHandler.removeCallbacksAndMessages(null);
        if (mConn != null) {
            try { unbindService(mConn); } catch (Throwable ignored) { }
            mConn = null;
        }
        super.onDestroy();
    }
}
