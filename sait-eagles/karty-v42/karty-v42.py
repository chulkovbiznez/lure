# -*- coding: utf-8 -*-
"""Карты EAGLES v42 (18.11.2026, новый стиль обложек от дизайн-Claude Андрея).
Меняет ТОЛЬКО два промпта, которые Карты отдают в LURE:
  CVPROMPT — «✦ Создать в LURE» для обложки карты (шаблон A: золото как знак EAGLES под жидким стеклом);
  ICPROMPT — «✦ В LURE» для иконки острова (шаблон B: золотой символ в круглой линзе жидкого стекла).
Совы, пластилин, soft-clay, кремовый пластик убраны; негатив дописан в конец после «Avoid:».
Макет, шрифты, бейджи, логика, сервер — без изменений. Ставится на любую версию с этими промптами (с v41 и без).
Запуск: python3 karty-v42.py ВХОД.html ВЫХОД.html
"""
import sys, re, hashlib
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8', newline='').read()
if 'KARTY v42' in s:
    print('СТОП: v42 уже стоит'); sys.exit(1)

NEG = ("owl, owls, animal mascot, cute animal, cartoon character, clay, claymation, plasticine, play-doh, "
       "matte plastic, cream plastic, beige plastic, white plastic, soft rounded toy, toy, kawaii, chibi, "
       "Pixar style, Disney style, emoji, sticker, flat vector, flat illustration, clip art, childish, "
       "pastel colors, white background, light background, blue, purple, green, rainbow, oversaturated, "
       "rounded blob shapes, multiple objects, cluttered, collage, text, letters, words, numbers, logo, "
       "watermark, signature, frosted opaque glass, milky glass, glass hiding the object, frame, border, "
       "cropped object, object touching edges, blurry, low quality, deformed")

SUBJ = ("Choose ONE concrete, adult, premium physical object (or a tiny scene) that is a strong metaphor for this title "
        "and reads at first glance. Never animals or mascots (an eagle only if the title is about EAGLES itself, "
        "then a gold eagle head above gold chevrons). If the title names a brand or service, recreate the shape of its "
        "symbol in gold, without any letters. If the title is unclear, use a single golden eagle feather resting on black stone.")

CV = ("// KARTY v42 (18.11.2026): обложка — золото как знак EAGLES под жидким стеклом\n"
      "const CVPROMPT=w=>`Premium 3D icon illustration, square 1:1 composition.\n"
      "Card title (the user's own card name, may be in Russian): \"${w}\".\n"
      "The image must clearly illustrate this title. " + SUBJ + "\n"
      "Single hero object, sculpted as a bold 3D icon made of polished mirror gold and glossy black metal, in exactly the same style as the EAGLES gold chevron logo: thick beveled gold edges, sharp facets, chamfered corners, warm golden glow around the edges.\n"
      "Liquid glass layer: the gold object sits inside a thick rounded slab of clear liquid glass (Apple Liquid Glass style): transparent, softly refracting the gold, glossy curved highlights along the glass edges, subtle chromatic edge, a few tiny inner reflections. The gold stays bright and clearly visible through the glass.\n"
      "Background: pure deep black (#070708) with a soft warm orange glow (#ff7a1a) behind the object.\n"
      "Lighting: studio lighting, bright specular highlights on the gold (#ffd23f), strong rim light, soft reflection under the object.\n"
      "Framing: centered, fills 60% of the frame, dark margin all around, nothing touches the edges, the bottom 25% stays calm and dark.\n"
      "High-end 3D render, Octane, crisp edges, premium app icon quality.\n"
      "No text, no letters, no logos.\n"
      "Avoid: " + NEG + ".`;")

IC = ("// KARTY v42 (18.11.2026): иконка острова — золотой символ в линзе жидкого стекла\n"
      "const ICPROMPT=w=>`Premium 3D emblem icon, square 1:1 composition.\n"
      "Island title (the user's own island name, may be in Russian): \"${w}\".\n"
      + SUBJ + " Make it a simple symbol with a bold silhouette.\n"
      "The symbol is sculpted from polished mirror gold and glossy black metal in exactly the style of the EAGLES gold chevron logo: thick beveled gold edges, sharp facets, warm golden glow.\n"
      "The symbol is encased in a round lens of clear liquid glass (Apple Liquid Glass style): transparent, softly refracting the gold, glossy curved highlight on the glass rim.\n"
      "Clean simple silhouette that stays readable at 64 px.\n"
      "Background: pure deep black (#070708), soft orange glow (#ff7a1a) behind.\n"
      "Lighting: bright specular highlights on gold (#ffd23f), rim light, soft reflection below.\n"
      "Centered, fills 70% of the frame, dark margin all around.\n"
      "High-end 3D render, crisp, premium app icon quality.\n"
      "No text, no letters, no logos.\n"
      "Avoid: " + NEG + ".`;")

def sub(name, new):
    global s
    pat = re.compile(r'const ' + name + r'=w=>`[^`]*`;')
    found = pat.findall(s)
    if len(found) != 1:
        print('СТОП: промпт', name, 'найден', len(found), 'раз'); sys.exit(1)
    s = pat.sub(lambda m: new, s)

sub('CVPROMPT', CV)
sub('ICPROMPT', IC)
if s.count('KARTY v42') != 2 or 'soft-clay' in s:
    print('СТОП: проверка после замены не прошла'); sys.exit(1)
b = s.encode('utf-8')
open(dst, 'wb').write(b)
print('ГОТОВО', dst, len(b), 'байт, md5', hashlib.md5(b).hexdigest())
