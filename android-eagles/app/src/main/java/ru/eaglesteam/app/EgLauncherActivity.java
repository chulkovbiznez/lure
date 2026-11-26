package ru.eaglesteam.app;

import android.content.ComponentName;
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
 */
public class EgLauncherActivity extends LauncherActivity {
    private static final Uri ORIGIN = Uri.parse("https://app.eaglesteam.ru");
    private static final Uri START = Uri.parse("https://app.eaglesteam.ru/profile.html?app=android&v=15");
    private static final long MAX_WAIT_MS = 4000;

    private final Handler mHandler = new Handler(Looper.getMainLooper());
    private CustomTabsServiceConnection mConn;
    private boolean mLaunched;

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
        super.onCreate(savedInstanceState);
        if (isFinishing()) return;
        showSplash();
        mHandler.postDelayed(this::go, MAX_WAIT_MS);
        try {
            TwaProviderPicker.Action action = TwaProviderPicker.pickProvider(getPackageManager());
            String provider = action.provider;
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
                                mHandler.post(EgLauncherActivity.this::go);
                            }
                        });
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
            ImageView v = new ImageView(this);
            v.setImageResource(R.drawable.splash);
            v.setScaleType(ImageView.ScaleType.CENTER_CROP);
            v.setBackgroundColor(Color.rgb(7, 7, 8));
            setContentView(v);
        } catch (Throwable ignored) { }
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
