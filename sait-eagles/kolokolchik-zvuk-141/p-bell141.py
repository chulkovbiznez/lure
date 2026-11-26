# Колокольчик в Профиле: новый звук Андрея (26.11.2026, задание 141). Меняет только SND и второй удар (без звука, т.к. звук длиннее).
import sys, base64, re
f, mp3 = sys.argv[1], sys.argv[2]
S = open(f, encoding='utf8').read()
if 'egBell141' in S: sys.exit('STOP: 141 уже стоит')
m = re.findall(r"var SND = '[A-Za-z0-9+/=]+';", S)
if len(m) != 1: sys.exit('STOP: SND найден %d раз' % len(m))
b = base64.b64encode(open(mp3, 'rb').read()).decode()
S = S.replace(m[0], "var SND = '" + b + "'; /* egBell141: звук Андрея 26.11 */")
old = "timers.push(setTimeout(function () { ringOnce(snd); }, 300 + 2350));"
if S.count(old) != 1: sys.exit('STOP: второй удар не найден')
S = S.replace(old, "timers.push(setTimeout(function () { ringOnce(false); }, 300 + 2350));")
open(f, 'w', encoding='utf8').write(S); print('141 OK')
