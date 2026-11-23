import sys
src, dst, blk = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding='utf-8').read()
if 'ВЫВОД v1' in s: sys.exit('СТОП: уже есть ВЫВОД v1')
R = [
 ("if (action === 'kop_get') return kopGet_(me);", "if (String(action || '').indexOf('wd_') === 0) return wd_(action, me, p); if (action === 'kop_get') return kopGet_(me);"),
 ("if (action === 'adm_kassa') return kassa_();", "if (action === 'adm_kassa') return kassa_(); if (action === 'adm_wd_list' || action === 'adm_wd_set') return admWd_(action, p);"),
 ("var kop = kopApply_(me, tot, conf, now);", "var wdo = wdApply_(me, tot); var kop = kopApply_(me, tot, conf, now);"),
 ("minWithdraw: MIN_WITHDRAW, kop: kop };", "minWithdraw: MIN_WITHDRAW, kop: kop, wd: wdo };"),
 ("var payNext = 0, payPeople = 0;", "var wdK = wdKassa_(tot, list); var payNext = 0, payPeople = 0;"),
 ("paidOut: 0, totals: tot,", "paidOut: wdK.done, wdPending: wdK.pending, totals: tot,"),
]
for a, b in R:
    n = s.count(a)
    if n != 1: sys.exit('СТОП: нашлось %d раз: %s' % (n, a))
    s = s.replace(a, b)
s = s.rstrip('\n') + '\n\n' + open(blk, encoding='utf-8').read()
open(dst, 'w', encoding='utf-8').write(s)
print('ГОТОВО', len(s.encode()))
