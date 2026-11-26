# Колокольчик 141б (26.11.2026): звук Андрея в 2 раза короче (1,95 с), звенит 2 раза. Ставится поверх 141.
import sys, base64, re
f, mp3 = sys.argv[1], sys.argv[2]
S = open(f, encoding='utf8').read()
if 'egBell141b' in S: sys.exit('STOP: 141б уже стоит')
m = re.findall(r"var SND = '[A-Za-z0-9+/=]+'; /\* egBell141: звук Андрея 26.11 \*/", S)
if len(m) != 1: sys.exit('STOP: нет 141')
b = base64.b64encode(open(mp3, 'rb').read()).decode()
S = S.replace(m[0], "var SND = '" + b + "'; /* egBell141b: звук Андрея 26.11, короткий, 2 раза */")
old = "timers.push(setTimeout(function () { ringOnce(false); }, 300 + 2350));"
if S.count(old) != 1: sys.exit('STOP: второй удар не найден')
S = S.replace(old, "timers.push(setTimeout(function () { ringOnce(snd); }, 300 + 2350));")
open(f, 'w', encoding='utf8').write(S); print('141b OK')
