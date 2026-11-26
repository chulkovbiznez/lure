from PIL import Image, ImageDraw, ImageFilter
import numpy as np, os
R='/tmp/lure/android-eagles/app/src/main/res'
logo=Image.open('logo-noslogan.png').convert('RGBA')
def bg(n):
    y,x=np.mgrid[0:n,0:n]; c=n/2
    d=np.sqrt((x-c)**2+((y-c*0.95))**2)/(n*0.42)
    g=np.clip(1-d,0,1)**1.6
    base=np.array([7,7,8],float); gold=np.array([120,82,14],float)
    arr=base+(gold-base)*g[...,None]
    return Image.fromarray(arr.astype('uint8'),'RGB')
def fg(n,wdp=66):
    im=Image.new('RGBA',(n,n),(0,0,0,0))
    w=int(n*wdp/108); h=int(w*logo.height/logo.width)
    l=logo.resize((w,h),Image.LANCZOS)
    im.alpha_composite(l,((n-w)//2,(n-h)//2+int(n*0.01)))
    return im
for d,n in dict(mdpi=108,hdpi=162,xhdpi=216,xxhdpi=324,xxxhdpi=432).items():
    bg(n).save(f'{R}/mipmap-{d}/ic_launcher_background.png',optimize=True)
    fg(n).save(f'{R}/mipmap-{d}/ic_launcher_foreground.png',optimize=True)
os.makedirs(f'{R}/mipmap-anydpi-v26',exist_ok=True)
x='''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
'''
for f in ['ic_launcher.xml','ic_launcher_round.xml']: open(f'{R}/mipmap-anydpi-v26/{f}','w').write(x)
# preview: crop 72dp visible area, apply masks
n=432; full=bg(n).convert('RGBA'); full.alpha_composite(fg(n)); v=full.crop((72,72,360,360))
s=v.size[0]; out=Image.new('RGB',(s*3+80,s+40),(230,230,235))
for i,kind in enumerate(['circle','squircle','rr']):
    m=Image.new('L',(s,s),0); dr=ImageDraw.Draw(m)
    if kind=='circle': dr.ellipse((0,0,s-1,s-1),fill=255)
    elif kind=='squircle': dr.rounded_rectangle((0,0,s-1,s-1),radius=int(s*0.32),fill=255)
    else: dr.rounded_rectangle((0,0,s-1,s-1),radius=int(s*0.2),fill=255)
    out.paste(v,(20+i*(s+20),20),m)
out.save('icon-preview.png')
