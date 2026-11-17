# Логотип Андрея ƎVE: сдвинуть обе E к V, промежуток меньше на 50%.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
k=float(sys.argv[1]) if len(sys.argv)>1 else 0.5
im=np.array(Image.open('src3.png').convert('RGBA'))
A=im[...,3]
lab,n=ndimage.label(A>30); sz=ndimage.sum(np.ones_like(A),lab,range(1,n+1))
big=[i+1 for i,s in enumerate(sz) if s>2000]; assert len(big)==3
fo=ndimage.find_objects(lab); big.sort(key=lambda i:fo[i-1][1].start)
L,V,R=big
# каждый пиксель с альфой — к ближайшей из трёх букв
m=np.isin(lab,big); idx=ndimage.distance_transform_edt(~m,return_distances=False,return_indices=True)
own=lab[idx[0],idx[1]]; own[A==0]=0
def gap(a,b):
    g=[]
    for y in range(A.shape[0]):
        xa=np.where((lab[y]==a))[0]; xb=np.where((lab[y]==b))[0]
        if len(xa) and len(xb): g.append(xb.min()-xa.max())
    return min(g)
g1,g2=gap(L,V),gap(V,R); d1,d2=(int(sys.argv[2]),int(sys.argv[3])) if len(sys.argv)>3 else (round(g1*k),round(g2*k)); print('gaps',g1,g2,'shift',d1,d2)
H,W=A.shape
def layer(i):
    out=np.zeros_like(im); mk=own==i; out[mk]=im[mk]; return Image.fromarray(out,'RGBA')
canvas=Image.new('RGBA',(W,H),(0,0,0,0))
canvas.alpha_composite(layer(V))
lt=Image.new('RGBA',(W,H),(0,0,0,0)); lt.paste(layer(L),(d1,0)); canvas.alpha_composite(lt)
rt=Image.new('RGBA',(W,H),(0,0,0,0)); rt.paste(layer(R),(-d2,0)); canvas.alpha_composite(rt)
bb=canvas.getchannel('A').point(lambda v:255 if v>3 else 0).getbbox(); c=canvas.crop((max(bb[0]-8,0),max(bb[1]-8,0),min(bb[2]+8,W),min(bb[3]+8,H)))
c.save('eve-andrey-blizhe.png',optimize=True); print(c.size)
for col,nm in (((14,11,8),'p4d.png'),):
    bg=Image.new('RGBA',c.size,col+(255,)); bg.alpha_composite(c); bg.convert('RGB').resize((1000,round(1000*c.height/c.width)),Image.LANCZOS).save(nm)
