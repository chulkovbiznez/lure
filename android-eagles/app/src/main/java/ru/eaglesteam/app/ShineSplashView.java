package ru.eaglesteam.app;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.LinearGradient;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Shader;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;

/**
 * 1.6 (26.11.2026): заставка EAGLES с золотым переливом по логотипу (как на сайте).
 * Картинка splash рисуется на весь экран (CENTER_CROP), поверх по форме логотипа
 * (маска splash_shine) пробегает светлая полоса, раз в ~2,2 с.
 */
public class ShineSplashView extends View {
    private Bitmap mImg, mMask;
    private final Matrix mM = new Matrix();
    private final Paint mBmp = new Paint(Paint.FILTER_BITMAP_FLAG);
    private final Paint mShine = new Paint(Paint.ANTI_ALIAS_FLAG);
    private float mT = 0f;
    private ValueAnimator mAnim;

    public ShineSplashView(Context c) {
        super(c);
        setBackgroundColor(0xFF070708);
        BitmapFactory.Options o = new BitmapFactory.Options();
        o.inScaled = false;
        try { mImg = BitmapFactory.decodeResource(getResources(), R.drawable.splash, o); } catch (Throwable ignored) { }
        try { mMask = BitmapFactory.decodeResource(getResources(), R.drawable.splash_shine, o); } catch (Throwable ignored) { }
        mShine.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_IN));
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        mAnim = ValueAnimator.ofFloat(0f, 1f);
        mAnim.setDuration(2200);
        mAnim.setRepeatCount(ValueAnimator.INFINITE);
        mAnim.setInterpolator(new AccelerateDecelerateInterpolator());
        mAnim.addUpdateListener(a -> { mT = (float) a.getAnimatedValue(); invalidate(); });
        mAnim.start();
    }

    @Override
    protected void onDetachedFromWindow() {
        if (mAnim != null) mAnim.cancel();
        super.onDetachedFromWindow();
    }

    @Override
    protected void onDraw(Canvas c) {
        super.onDraw(c);
        if (mImg == null) return;
        int w = getWidth(), h = getHeight();
        float s = Math.max(w / (float) mImg.getWidth(), h / (float) mImg.getHeight());
        mM.setScale(s, s);
        mM.postTranslate((w - mImg.getWidth() * s) / 2f, (h - mImg.getHeight() * s) / 2f);
        c.drawBitmap(mImg, mM, mBmp);
        if (mMask == null) return;
        // полоса идёт слева направо за первые 70 % цикла, потом пауза
        float p = Math.min(1f, mT / 0.7f);
        if (p >= 1f) return;
        float band = w * 0.45f;
        float x = -band + (w + 2 * band) * p;
        int save = c.saveLayer(0, 0, w, h, null);
        c.drawBitmap(mMask, mM, mBmp);
        mShine.setShader(new LinearGradient(x - band / 2f, h * 0.38f, x + band / 2f, h * 0.62f,
                new int[]{0x00FFF6D6, 0xC8FFF6D6, 0x00FFF6D6}, new float[]{0f, 0.5f, 1f},
                Shader.TileMode.CLAMP));
        c.drawRect(0, 0, w, h, mShine);
        c.restoreToCount(save);
    }
}
