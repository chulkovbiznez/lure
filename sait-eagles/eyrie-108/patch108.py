# Задание 108 (21.11.2026): Обучение у всех, вкладка EYRIE.
#   python3 patch108.py page   ВХОД.html ВЫХОД.html   — заменить блок egObOnly1 (задание 84) на egOb108
#   python3 patch108.py kontent eg-kontent-do.js eg-kontent-new.js — правила уроков (гость серое, бесплатный 3 первых)
#   python3 patch108.py desk   desk-do.js desk-new.js  — левое меню ноутбука на документах: Обучение всем, «EYRIE»
# Ничего не заливает, только пишет новый файл и печатает «ГОТОВО … md5» или «СТОП: …».
import sys, os, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
def rd(p):
    with open(p, encoding='utf-8') as f: return f.read()
def wr(p, s):
    with open(p, 'w', encoding='utf-8', newline='') as f: f.write(s)
def md5(s): return hashlib.md5(s.encode('utf-8')).hexdigest()
def stop(m): print('СТОП: ' + m); sys.exit(1)

def rep(s, old, new, name):
    n = s.count(old)
    if n != 1: stop('%s: нашлось %d мест вместо 1' % (name, n))
    return s.replace(old, new)

mode, src, dst = sys.argv[1], sys.argv[2], sys.argv[3]
s = rd(src)

if mode == 'page':
    if 'egOb108' in s: stop('блок 108 уже стоит в ' + src)
    old = rd(os.path.join(HERE, 'blok-84.html'))
    new = rd(os.path.join(HERE, 'blok-108.html'))
    if s.count(old) != 1: stop('в %s нет блока задания 84 (egObOnly1) — страницу не трогаем' % src)
    s = s.replace(old, new)
elif mode == 'kontent':
    if md5(s) != 'ae8dc4c051fa60957c9f12b1d2aa90a2': stop('eg-kontent.js не той версии (md5 ' + md5(s) + '), ничего не меняем')
    s = rep(s, "function canSee(x){ return !x.pro || ME.role === 'pro'; }",
        "/* задание 108: гость видит все уроки серыми; бесплатный — 3 самых первых урока (по дате загрузки), кроме «Только Pro»; Pro — всё */\n"
        "function firstIds(){ return D.uroki.slice().sort(function(a, b){ return (a.at || 0) - (b.at || 0); }).slice(0, 3).map(function(u){ return u.id; }); }\n"
        "function canSee(x){ if(ME.role === 'pro') return true; if(ME.role === 'guest') return false; return !x.pro && !x.locked && firstIds().indexOf(x.id) >= 0; }", 'canSee')
    s = rep(s, "if(!canSee(x)) return toast('Этот урок для EAGLES Pro');",
        "if(!canSee(x)) return toast(ME.role === 'guest' ? 'Войди в EAGLES: 3 первых урока бесплатно' : 'Этот урок для EAGLES Pro. Бесплатно открыты 3 первых урока');", 'lesOpen')
    s = rep(s, "(x.pro ? 'для EAGLES Pro' : 'открыт всем') + '</small><b>'",
        "(lock ? (ME.role === 'guest' ? 'после входа' : 'для EAGLES Pro') : (x.pro || firstIds().indexOf(x.id) < 0 ? 'для EAGLES Pro' : 'бесплатный урок')) + '</small><b>'", 'lesCard-label')
    s = rep(s, "(x.pro ? '<span>PRO</span>' : '<span class=\"free\">открыт всем</span>')",
        "(x.pro || firstIds().indexOf(x.id) < 0 ? '<span>PRO</span>' : '<span class=\"free\">бесплатный урок</span>')", 'kanal-card-label')
    s = rep(s, "'>🔒 Урок для EAGLES Pro</div>'",
        "'>' + (ME.role === 'guest' ? '🔒 Войди, чтобы смотреть' : '🔒 Урок для EAGLES Pro') + '</div>'", 'lesCard-lock')
elif mode == 'desk':
    if md5(s) != '91d350266d96efe7f28362562eacc7fb': stop('desk.js не той версии (md5 ' + md5(s) + '), ничего не меняем')
    s = rep(s, "  if(['11111','23933'].indexOf(id)>=0)B.push(['/obuchenie.html','Обучение',", "  B.push(['/obuchenie.html','Обучение',", 'desk-obuch')
    s = rep(s, "B.push(['/kanal.html','Канал',", "B.push(['/eyrie.html','EYRIE',", 'desk-kanal')
else:
    stop('неизвестный режим ' + mode)

wr(dst, s)
print('ГОТОВО %s → %s md5 %s байт %d' % (src, dst, md5(s), len(s.encode('utf-8'))))
