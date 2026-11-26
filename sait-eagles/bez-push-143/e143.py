import sys
S=open(sys.argv[1],encoding='utf-8').read()
def rep(a,b,tag):
    global S
    assert S.count(a)==1,(tag,S.count(a)); S=S.replace(a,b)
rep("if (m.t === 'ringing') { call.cid = m.cid;",
    "if (m.t === 'ringing' && m.off && !vals(call.peers).length) { call.byMe = true; send({ t: 'hangup', cid: m.cid }); finish(WHY.offline); return; } // 143: человек не в EAGLES — звонок в закрытое приложение не пробиваем\n    if (m.t === 'ringing') { call.cid = m.cid;",'ring')
rep("if (document.hidden && window.Notification && Notification.permission === 'granted') {","if (false && document.hidden && window.Notification) { // 143: уведомлений нет, звонок только в открытом EAGLES",'notif')
open(sys.argv[2],'w',encoding='utf-8').write(S)
