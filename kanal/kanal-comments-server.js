// ===================== KANAL COMMENTS v1 (2026-11-18) =====================
// Добавка к блокам KANAL POSTS v1/v2 (они остаются выше). Диспетчер зовёт kanalPosts3_ вместо kanalPosts2_.
// Правило Андрея 18.11: человек в канале правит и удаляет ТОЛЬКО СВОИ комментарии.
// KP_OWNER_CAN_DEL = true → хозяин канала (и Андрей 11111) может УДАЛИТЬ чужой комментарий под своими постами (но не править).
//   kp_coms&ch=&p=            → { items:[{k,id,name,text,ts,ed,own,del,mine}] }  own — мой (можно править), del — можно удалить, ed — время правки
//   kp_cedit&ch=&p=&k=&text=  → { ok, item:{k,text,ed} }   только автор; до 500 знаков; не чаще 30 правок в час
//   kp_cdel&ch=&p=&k=         → { ok }                     автор (или хозяин канала, если KP_OWNER_CAN_DEL)
// Лист kp_com: столбец 8 (Ed) = время правки. Удаление мягкое (Del = '1'), как было.
var KP_OWNER_CAN_DEL = true, KP_EDIT_PER_HOUR = 30;
function kanalPosts3_(action, e, p) {
  if (action !== 'kp_coms' && action !== 'kp_cedit' && action !== 'kp_cdel') return kanalPosts2_(action, e, p);
  var ch = kpCh_(p.ch);
  if (!ch) return jsonOut_({ ok: false, error: 'bad_ch' });
  var post = kpPost2_(p.p);
  if (!post) return jsonOut_({ ok: false, error: 'bad_post' });
  var me = '';
  if (p.sess) { try { me = sessionId_(e) || ''; } catch (err) { me = ''; } }
  var boss = !!me && KP_OWNER_CAN_DEL && (me === ch || me === OWNER_ID);

  if (action === 'kp_coms') {
    var d = kpComSheet_().getDataRange().getValues(), items = [];
    for (var k = 1; k < d.length; k++) {
      if (String(d[k][0]) !== ch || String(d[k][1]) !== post || String(d[k][6]) === '1') continue;
      var cid = normId_(d[k][2]), own = !!me && cid === me;
      items.push({ k: k + 1, id: cid, name: String(d[k][3] || ''), text: String(d[k][4] || '').replace(/^'/, ''), ts: Number(d[k][5]) || 0,
        ed: Number(d[k][7]) || 0, own: own, del: own || boss, mine: own || boss });
    }
    return jsonOut_({ ok: true, items: items.slice(-200) });
  }

  if (!me) return noAuth_();
  if (frozenAt_(me)) return frozenOut_();
  var U = usersLite_();
  if (!U[me]) return noAuth_();
  var csh = kpComSheet_(), krow = Number(p.k) || 0;
  if (krow < 2 || krow > csh.getLastRow()) return jsonOut_({ ok: false, error: 'bad_k' });
  var cv = csh.getRange(krow, 1, 1, 7).getValues()[0];
  if (String(cv[0]) !== ch || String(cv[1]) !== post || String(cv[6]) === '1') return jsonOut_({ ok: false, error: 'bad_k' });
  var mine = normId_(cv[2]) === me;

  if (action === 'kp_cedit') {
    if (!mine) return jsonOut_({ ok: false, error: 'forbidden' });
    var text = String(p.text || '').replace(/\s+/g, ' ').trim().slice(0, KP_COM_MAX);
    if (!text) return jsonOut_({ ok: false, error: 'empty' });
    if (me !== OWNER_ID && !kpRate_('KPE_' + me, KP_EDIT_PER_HOUR, 3600)) return jsonOut_({ ok: false, error: 'limit' });
    var now = Date.now();
    csh.getRange(krow, 5).setValue(safe_(text));
    csh.getRange(krow, 8).setValue(now);
    return jsonOut_({ ok: true, item: { k: krow, text: text, ed: now } });
  }

  // kp_cdel
  if (!mine && !boss) return jsonOut_({ ok: false, error: 'forbidden' });
  csh.getRange(krow, 7).setValue('1');
  return jsonOut_({ ok: true });
}
// =================== end of block KANAL COMMENTS v1 ===================
