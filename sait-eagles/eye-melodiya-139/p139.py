import sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
assert 'eyeMel139' not in s
a=s.find('  var tone = null;\n  function startTone() {'); b=s.find('  function stopTone()',a); e=s.find('\n',b)
assert a>0 and b>a
new='''  var tone = null;
  /* eyeMel139 (26.11.2026): входящий звонок играет фирменную мелодию EYE (/eye-zvonok.mp3, та же, что в приложении 1.11+);
     если телефон не дал звук без касания — старый двойной сигнал как запасной */
  function beepTone() {
    try {
      var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      var ctx = new A(), on = true;
      tone = { ctx: ctx, iv: setInterval(function () {
        if (!on) return;
        [880, 1175].forEach(function (f, i) {
          var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
          var t = ctx.currentTime + i * 0.18; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
          o.start(t); o.stop(t + 0.17);
        });
      }, 1300) };
    } catch (e) {}
  }
  function startTone() {
    stopTone();
    try {
      var au = new Audio('/eye-zvonok.mp3'); au.loop = true; au.volume = 1;
      tone = { au: au };
      var p = au.play();
      if (p && p.catch) p.catch(function () { if (tone && tone.au === au) { tone = null; beepTone(); } });
    } catch (e) { beepTone(); }
    if (navigator.vibrate) try { navigator.vibrate([400, 200, 400]); } catch (e) {}
  }
  function stopTone() { if (tone) { if (tone.au) { try { tone.au.pause(); tone.au.src = ''; } catch (e) {} } if (tone.iv) clearInterval(tone.iv); if (tone.ctx) { try { tone.ctx.close(); } catch (e) {} } tone = null; } }'''
s=s[:a]+new+s[e:]
open(dst,'w',encoding='utf-8').write(s)
