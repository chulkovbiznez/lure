# Задание «Один пакет PRO 499» (27.11.2026): правка server.js eagles-server.
import sys, re
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
o = s
def rep(a, b, n=1):
    global s
    c = s.count(a)
    if c != n: sys.exit('FAIL count %d != %d for: %s' % (c, n, a[:80]))
    s = s.replace(a, b)
def rrep(pat, b, n=1):
    global s
    s2, c = re.subn(pat, b, s)
    if c != n: sys.exit('FAIL re %d != %d for: %s' % (c, n, pat))
    s = s2
rrep(r"E1:\s*\{ price: 499,\s*months: 1,\s*inv: 10, bin: 10, cap: 30000 \},\n\s*E6:\s*\{ price: 2590,\s*months: 6,\s*inv: 20, bin: 15, cap: 60000 \},\n\s*E12: \{ price: 4990, months: 12, inv: 25, bin: 20, cap: 100000 \}",
     "E1:  { price: 499, months: 1, inv: 25, bin: 20, cap: 100000 },   // ЕДИНСТВЕННЫЙ пакет: PRO 499 ₽ в месяц (27.11.2026)\n  E6:  { price: 499, months: 1, inv: 25, bin: 20, cap: 100000 },   // старое имя, не продаётся (совместимость с записями)\n  E12: { price: 499, months: 1, inv: 25, bin: 20, cap: 100000 }    // старое имя, не продаётся")
rrep(r"  if \(sum >= PKGS\.E12\.price\) return 'E12';\n  if \(sum >= PKGS\.E6\.price\) return 'E6';\n", "  // 27.11.2026: один пакет PRO 499 ₽ / месяц — любая оплата = E1\n")
rrep(r"var BIN_INVITE_PCT = 10;[^\n]*", "var BIN_INVITE_PCT = 25;           // расчёт: % с оплаты каждого лично приглашённого (PRO 499)")
rrep(r"var BIN_BINARY_PCT = 10;[^\n]*", "var BIN_BINARY_PCT = 20;           // расчёт: % от оборота слабой ноги (PRO 499)")
rep("payUrls: { E1: payUrl_(mu, 'E1'), E6: payUrl_(mu, 'E6'), E12: payUrl_(mu, 'E12') }", "payUrls: { E1: payUrl_(mu, 'E1') }")
rep("pkgs: PKGS,", "pkgs: { E1: PKGS.E1 },")
rep("'EAGLES · пакет ' + pkg + ' · ' + P.months + ' мес.'", "'EAGLES PRO · 1 месяц'")
rep("'💰 Оплата: ID ' + u.id + ' — пакет ' + pkg + ' на ' + months + ' мес., '", "'💰 Оплата: ID ' + u.id + ' — PRO на ' + months + ' мес., '")
rep("p.mode === 'month' ? 'E1' : 'E12', 0, 'gift'", "'E1', 0, 'gift'")
rep("if (id === OWNER_ID) return 'E12';", "if (id === OWNER_ID) return 'E1';")
rrep(r"\*   Пакеты E1[^\n]*", "*   ОДИН пакет: PRO 499 ₽ в месяц (с 27.11.2026). Личные 25 %, бинар 20 %, потолок бинара 100 000 ₽ в неделю. Деньги считает раздел «ДЕНЬГИ» (личные, бинар, матчинг,")
open(p, 'w', encoding='utf-8').write(s)
print('OK server.js', len(o), '->', len(s))
