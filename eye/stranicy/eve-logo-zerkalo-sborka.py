from PIL import Image, ImageFilter
import numpy as np, sys
a=int(sys.argv[1]) if len(sys.argv)>1 else 766
im=np.array(Image.open('src.png')).astype(np.float32)
H,W,_=im.shape
im[:386,:,3]=0            # иконки сверху
for x in range(316,402): im[386:404,x]=im[386:404,280]  # хвост облачка на верхнем крае Ǝ
for x in range(402,549): im[386:392,x]=im[386:392,280]
# найти низ букв: строки ниже 700, где МЕССЕНДЖЕР
A=im[...,3]
rows=[y for y in range(690,1024) if (A[y]>20).any()]
# первая пустая строка после 700
y=700
while (A[y]>20).any(): y+=1
bottom=y; print('bottom',bottom)
im[bottom:,:,3]=0
left=im[:, :a]
right=left[:, ::-1]
out=np.concatenate([left,right],axis=1)
o=Image.fromarray(out.clip(0,255).astype(np.uint8),'RGBA')
bb=o.getchannel('A').point(lambda v:255 if v>3 else 0).getbbox(); print('bbox',bb)
o=o.crop(bb)
o.save('eve-mirror-1x.png')
pad=0
s=3840/o.width
big=o.resize((3840,round(o.height*s)),Image.LANCZOS)
# premultiplied-like sharpen only RGB
rgb=big.convert('RGB').filter(ImageFilter.UnsharpMask(radius=2.2,percent=70,threshold=2))
big=Image.merge('RGBA',(*rgb.split(),big.getchannel('A')))
big.save('eve-logo-4k.png',optimize=True)
print(big.size)
for bgc,name in (((14,11,8),'prev-4k-dark.png'),((255,255,255),'prev-4k-white.png')):
    bg=Image.new('RGBA',big.size,bgc+(255,));bg.alpha_composite(big);bg.convert('RGB').resize((1280,round(1280*big.height/big.width)),Image.LANCZOS).save(name)
