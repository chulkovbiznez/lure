# Новый вход EAGLES (09.11.2026): вставляет vhod.css + vhod.js (с логотипом) в index.html сайта перед последним </body>.
# Запуск: python3 patch_index.py <живой index.html> <выход>. Старый код страницы не меняется.
import sys, os, base64
d = os.path.dirname(os.path.abspath(__file__))
s = open(sys.argv[1], encoding='utf-8').read()
if 'id="vhodV1"' in s: sys.exit('УЖЕ СТОИТ: в файле есть vhodV1, ничего не делаю')
for need in ['id="lgn"', 'id="cdo"', 'id="lId"', 'id="lBtn"', 'id="cCode"', 'id="cBtn"', 'id="cSt"', 'id="cResend"', 'login_verify']:
    if need not in s: sys.exit('СТОП: в index.html нет ' + need)
logo = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(d, 'eagles-logo.webp'), 'rb').read()).decode()
css = open(os.path.join(d, 'vhod.css'), encoding='utf-8').read()
js = open(os.path.join(d, 'vhod.js'), encoding='utf-8').read().replace('__LOGO__', logo)
block = '\n<!-- НОВЫЙ ВХОД 09.11.2026 -->\n<style id="vhodV1">\n' + css + '</style>\n<script>\n' + js + '</script>\n'
i = s.rfind('</body>')
if i < 0: sys.exit('СТОП: нет </body>')
s = s[:i] + block + s[i:]
open(sys.argv[2], 'w', encoding='utf-8').write(s)
print('ГОТОВО', len(s.encode('utf-8')), 'байт')
