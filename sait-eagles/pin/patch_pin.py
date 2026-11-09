# ПИН быстрее и компактнее (10.11.2026). profile.html: табло ПИН влезает в экран, цифры срабатывают сразу при касании.
# index.html: убраны кнопки размера текста «A− A+» вверху главной страницы.
# Запуск: python3 patch_pin.py profile <живой profile.html> <выход>   или   python3 patch_pin.py index <живой index.html> <выход>
import sys
kind, src, dst = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding='utf-8').read()
if kind == 'profile':
    if 'id="pinFastV1"' in s: sys.exit('УЖЕ СТОИТ: pinFastV1 уже есть, ничего не делаю')
    for need in ['id="egpKp"', '.egpn .pn-kp{', 'pn-lg2']:
        if need not in s: sys.exit('СТОП: в profile.html нет ' + need)
    block = '''
<!-- ПИН БЫСТРЕЕ И КОМПАКТНЕЕ 10.11.2026 -->
<style id="pinFastV1">
.egpn{--pk:clamp(52px,8.4vh,70px)}
.egpn .pn-tp{min-height:44px;padding-top:calc(8px + env(safe-area-inset-top,0px))}
.egpn .pn-lg2{width:min(50vw,200px,25vh);margin-top:0}
.egpn h2{font-size:20px;margin:min(12px,1.5vh) 16px 4px}
.egpn .pn-dr{margin:min(16px,2vh) 0 4px}
.egpn .pn-kp{grid-template-columns:repeat(3,var(--pk));gap:min(12px,1.5vh) clamp(18px,7vw,28px);margin:min(14px,1.8vh) 0 6px}
.egpn .pn-kp button{width:var(--pk);height:var(--pk);font-size:calc(var(--pk) * .38);touch-action:manipulation;-webkit-user-select:none;user-select:none;transition:background .08s,transform .08s}
.egpn .pn-kp button.pn-pr{background:#2e2519;transform:scale(.94)}
.egpn .pn-kp button.pn-tx{font-size:12.5px}
.egpn .pn-kp button.pn-tx.pn-dl{font-size:calc(var(--pk) * .32)}
.egpn .pn-kp button.pn-go{font-size:11px}
.egpn .pn-bt{margin:4px 20px 16px}
</style>
<script>
/* Цифры ПИН срабатывают в момент касания, без задержки браузера и без «двойного тапа». */
(function(){var KP=document.getElementById('egpKp');if(!KP)return;
  KP.addEventListener('touchstart',function(e){if(e.touches.length>1)return;var b=e.target.closest('button');if(!b||b.disabled)return;
    e.preventDefault();b.classList.add('pn-pr');setTimeout(function(){b.classList.remove('pn-pr')},110);b.click();},{passive:false});
})();
</script>
'''
elif kind == 'index':
    if 'id="fsOffV1"' in s: sys.exit('УЖЕ СТОИТ: fsOffV1 уже есть, ничего не делаю')
    if 'class="fsctl"' not in s: sys.exit('СТОП: в index.html нет fsctl')
    block = '\n<!-- УБРАНЫ A− A+ ВВЕРХУ 10.11.2026 -->\n<style id="fsOffV1">.egf .fsctl{display:none!important}</style>\n'
else:
    sys.exit('СТОП: первый параметр profile или index')
i = s.rfind('</body>')
if i < 0: sys.exit('СТОП: нет </body>')
s = s[:i] + block + s[i:]
open(dst, 'w', encoding='utf-8').write(s)
print('ГОТОВО', len(s.encode('utf-8')), 'байт')
