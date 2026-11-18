/* EAGLES: щелчок клавиатуры iPhone на каждый тап (18.11.2026).
   Замена старой функции egSoftTap(c): c = AudioContext, который уже создаёт и «будит» общий обработчик.
   Звук = klik-iphone.wav (12 мс, 48 кГц, моно, 1196 байт, md5 0426c81422731ec2edb6d2098b65ce01), вшит base64, без запросов в сеть.
   Буфер декодируется 1 раз и кэшируется в window.__egTapBuf (подходит к любому AudioContext на странице). */
var EG_TAP_WAV="data:audio/wav;base64,UklGRqQEAABXQVZFZm10IBAAAAABAAEAgLsAAAB3AQACABAAZGF0YYAEAAD+/wIABwAJAAkABAAHAAIA/P/+//z/8v/y//n/AgATABMABwACAPf/6P/v//z//P/+/wAA/P/8/wQACQAHAAAAAAAEAAcADAATAAkA/v/+//T/7//8/wAA/P/+//z/+f8AAAkAGgAkABoAIgAsACIAJAAiAAAA7f/v/+P/9P8aABYACQAJAPT/7f/8//L/8v8EAAAA9P/8//n/7f/m/9f/4//8//n/9P8AAPf/+f8TAA4ADgAiACQAMABGACkADAARAPf/4f/t/9T/wf/S/6j/ev+h/6v/jv/L/wkACQAuAEkAPQBrAJ4AhAB6AIQAWAAWAOj/2f/q/9f/pv+y/7X/if+h/9D/sv/B/wwABAD8/0YAWgAzAGYAiwBGAFMAdQAaADMAlQD8/xgA+wDJ/Nbw9N/zyXqyaKYSqsSz2r5YztXgY/NcBpkYTCjBNUBAcEaxSChHlEG5OB8tJB/wD3UAWvGS487XnM6HyL3FQcbzyUjQ1thJ4/DuGPsAB/YRgxsfI2IoQiuaK1kpDSVEHyYY2g+5Bl79afQr7AHld9/F2xfaotpF3cnh/ud077b3YQDXCKAQYxehHBsg3SHMIdsfRhw5F/MQ6QlvAtv6r/NX7RLoLOT14XnhtOKU5dbpIe879dT7eQLhCM8OxBNtF78ZihrLGbgXfBQvECALogXy/1n6M/XK8DjtpOpG6U3pq+o47bnw9vS4+aj+dQPvB9AL6A4uEW4ShhKoEeQPQQ3uCS0GSAJ3/tH6j/f09AHzxvFw8erxBvPI9BX3uPmf/LX/tgJzBcoHpQnbClULLAtyCiEJWAdKBQ4DwwCX/p386fqa+bL4PfhJ+Nn4y/n/+lv8x/0p/3AAkAF2AiQDngPKA6MDSQOzAgECaQHoAGQA/P+6/4v/df9//6H/1P8AAAcADAAJAAcADAARAAwADAAEAPL/5v/v//z/AAAEAAcABwAHAAwABwD+//n/6P/Q/7z/sP+h/5z/qP+3/8v/6v8MACkARgBhAGsAZABcAFgARgA1ACwAEwD5/+r/1//D/8b/yP+1/6T/n/+c/5//tf/Q/+P//v8iAD0ASwBfAGYAZgBuAG4AWgBEACwAEwAEAPf/1//B/7X/rf+1/8v/1P/S/9T/2f/m//f/AgAHABMAIgAkACcAMAA4ADAAJAAfABYAAgD0/+//6P/e/97/4//o/+r/9P/8//7//v8AAAQABAD+//7/AgACAP7//v/+/wAAAgAAAAAAAgAAAP7/AgACAPz/AAAEAP7//P8EAAQA/v/+/wIAAgAAAAAAAgAAAPz//v8CAAIAAAAAAP7//v8AAAIAAgAAAP3//f/9/wAAAQAAAP3//f8BAAEAAAAAAAAA/f///wMAAwADAAIAAgD//wAAAQAAAPz//v//////////////AAABAAAAAQACAAEA//8AAAAA//8AAAAAAAAAAAAAAQAAAAAAAQACAAEAAAD//////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
function egSoftTap(c){try{
  var B=window.__egTapBuf;
  var play=function(buf){var s=c.createBufferSource();s.buffer=buf;var g=c.createGain();g.gain.value=0.55;s.connect(g);g.connect(c.destination);s.start(0);};
  if(B&&B!=='w'){play(B);return;}
  if(B==='w')return;
  window.__egTapBuf='w';
  var bin=atob(EG_TAP_WAV.split(',')[1]),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  var ok=function(buf){window.__egTapBuf=buf;play(buf);},bad=function(){window.__egTapBuf=null;};
  var p=c.decodeAudioData(u.buffer,ok,bad);if(p&&p.catch)p.catch(bad);
}catch(e){}}
