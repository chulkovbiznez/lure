from PIL import Image, ImageDraw
import numpy as np, os, shutil
R='/tmp/lure/android-eagles/app/src/main/res'
logo=Image.open('logo-noslogan.png').convert('RGBA')
N=768
y,x=np.mgrid[0:N,0:N]; c=N/2
d=np.sqrt((x-c)**2+(y-c*0.95)**2)/(N*0.5)
g=np.clip(1-d,0,1)**1.5
base=np.array([7,7,8],float); gold=np.array([120,82,14],float)
bg=Image.fromarray((base+(gold-base)*g[...,None]).astype('uint8'),'RGB').convert('RGBA')
w=int(N*0.90); h=int(w*logo.height/logo.width)
bg.alpha_composite(logo.resize((w,h),Image.LANCZOS),((N-w)//2,(N-h)//2+int(N*0.01)))
S=4; m=Image.new('L',(N*S,N*S),0); ImageDraw.Draw(m).rounded_rectangle((0,0,N*S-1,N*S-1),radius=int(N*S*0.16),fill=255)
m=m.resize((N,N),Image.LANCZOS); bg.putalpha(m)
master=bg
for dd,n in dict(mdpi=48,hdpi=72,xhdpi=96,xxhdpi=144,xxxhdpi=192).items():
    im=master.resize((n,n),Image.LANCZOS)
    im.save(f'{R}/mipmap-{dd}/ic_launcher.png',optimize=True); im.save(f'{R}/mipmap-{dd}/ic_launcher_round.png',optimize=True)
    for f in ['ic_launcher_foreground.png','ic_launcher_background.png']:
        p=f'{R}/mipmap-{dd}/{f}'
        if os.path.exists(p): os.remove(p)
shutil.rmtree(f'{R}/mipmap-anydpi-v26',ignore_errors=True)
master.save('icon-master-1.6.png')
# preview on wallpaper-ish grey next to a rounded neighbour
pv=Image.new('RGBA',(520,260),(110,125,140,255))
pv.alpha_composite(master.resize((200,200),Image.LANCZOS),(30,30))
pv.alpha_composite(master.resize((96,96),Image.LANCZOS),(300,82))
pv.save('icon-preview-1.6.png')
