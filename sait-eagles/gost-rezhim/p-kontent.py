import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70])
    s = s.replace(a, b)
rep("/* задание 108: гость видит все уроки серыми; бесплатный — 3 самых первых урока (по дате загрузки), кроме «Только Pro»; Pro — всё */\nfunction firstIds(){ return D.uroki.slice().sort(function(a, b){ return (a.at || 0) - (b.at || 0); }).slice(0, 3).map(function(u){ return u.id; }); }\nfunction canSee(x){ if(ME.role === 'pro') return true; if(ME.role === 'guest') return false; return !x.pro && !x.locked && firstIds().indexOf(x.id) >= 0; }",
    "/* 27.11.2026 витрина до старта (Андрей): всем (и гостям) открыты 3 САМЫХ НОВЫХ урока (кроме «Только Pro»), остальные серые →\n   «В декабре доступно всем с PRO». Всё видят только PRO 11111–11114. (было, задание 108: гость — все серые; FREE — 3 первых) */\nvar FULLK = ['11111', '11112', '11113', '11114'];\nfunction fullK(){ return !!(MOD || (ME.id && FULLK.indexOf(String(ME.id)) >= 0)); }\nfunction firstIds(){ return D.uroki.filter(function(u){ return !u.pro && !u.locked; }).sort(function(a, b){ return (b.at || 0) - (a.at || 0); }).slice(0, 3).map(function(u){ return u.id; }); }\nfunction canSee(x){ if(fullK()) return true; return !x.pro && !x.locked && firstIds().indexOf(x.id) >= 0; }\nfunction soonPro(){ if(window.egGost) window.egGost.show('lesson'); else toast('В декабре будет доступно всем с PRO'); }")
rep("  if(!canSee(x)) return toast(ME.role === 'guest' ? 'Войди в EAGLES: 3 первых урока бесплатно' : 'Этот урок для EAGLES Pro. Бесплатно открыты 3 первых урока');",
    "  if(!canSee(x)) return soonPro();")
rep("(lock ? (ME.role === 'guest' ? 'после входа' : 'для EAGLES Pro')", "(lock ? 'в декабре с PRO'")
rep("(ME.role === 'guest' ? '🔒 Войди, чтобы смотреть' : '🔒 Урок для EAGLES Pro')", "'🔒 В декабре с PRO'")
rep("<small>' + (x.pro ? 'Для EAGLES Pro' : 'Открыт всем') + '</small>", "<small>' + (lock ? 'В декабре с PRO' : 'Открыт всем') + '</small>")
rep("var px = PLAN[+pl.dataset.plan]; toast(", "var px = PLAN[+pl.dataset.plan]; if(!fullK()) return soonPro(); toast(")
s = s.replace("/* EAGLES · Загрузка контента", "/* 27.11.2026 v7: витрина до старта — 3 новых урока всем, остальные «в декабре с PRO» (поиск: FULLK).\n   EAGLES · Загрузка контента", 1)
open(dst, 'w', encoding='utf-8').write(s); print('ok')
