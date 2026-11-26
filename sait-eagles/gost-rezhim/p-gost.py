# 27.11.2026 «Витрина до старта»: регистрация закрыта для всех; менять что-либо могут только 11111–11114.
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
assert 'PREVIEW_MODE' not in s, 'already patched'
blk = r"""// ===== 27.11.2026 ВИТРИНА ДО СТАРТА (Андрей): гости и FREE только смотрят =====
// Регистрация закрыта для всех (reg_closed). Изменения (сохранить, отправить, добавить, удалить, лайк, коммент…)
// разрешены только PREVIEW_FULL; остальным pro_only. Чтение не трогаем. В декабре: PREVIEW_MODE = false.
var PREVIEW_MODE = true, PREVIEW_FULL = ['11111', '11112', '11113', '11114'];
var PREVIEW_WRITE = /^(start_go|vlink_send|vlink_reset|chat_send|chat_block|ann_send|bin_join|bin_place|bin_fix|fr_add|fr_del|ec_del|ec_hid|ec_voice|kp_add|kp_hello|kp_del|kp_like|kp_swoop|kp_com|kp_cdel|kp_cedit|kc_keep|kc_upurl|kc_img|kc_add|kc_fold|kc_del|kc_folddel|update_profile|map_save|kop_save|img_put|img_del|avatar_upload|candidates_save|tax_set|videos_save)$/;
function previewGuard_(e, act) {
  if (!PREVIEW_MODE || !act) return null;
  act = String(act);
  if (act === 'reg_request' || act === 'reg_verify') return jsonOut_({ ok: false, error: 'reg_closed' });
  if (!PREVIEW_WRITE.test(act)) return null;
  var me = '';
  try { me = sessionId_(e) || ''; } catch (err) { me = ''; }
  if (me && PREVIEW_FULL.indexOf(me) >= 0) return null;
  return jsonOut_({ ok: false, error: me ? 'pro_only' : 'auth' });
}

"""
a = "function doGet(e) {\n"
assert s.count(a) == 1
s = s.replace(a, blk + a)
g = "  var p = e.parameter;\n  var action = p.action;\n"
i = s.index(blk) + len(blk)
j = s.index(g, i); assert j - i < 200, 'doGet head moved'
s = s[:j] + g + "  var pvg = previewGuard_(e, action); if (pvg) return pvg;   // 27.11 витрина\n" + s[j + len(g):]
h = "  var me = sessionId_(e);\n  if (!me) return noAuth_();\n  var p = e.parameter;\n  var type = p.type;\n"
assert s.count(h) == 1, 'doPost head'
s = s.replace(h, "  var pvp = previewGuard_(e, e && e.parameter && e.parameter.type); if (pvp) return pvp;   // 27.11 витрина\n" + h)
open(p, 'w', encoding='utf-8').write(s); print('patched gost')
