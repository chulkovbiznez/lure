import sys
p=sys.argv[1]; s=open(p).read()
old="""  const r = await fetch(ENV.DOCAPI, signedFetchArgs(ENV.DOCAPI, 'dynamodb', body, {
    'content-type': 'application/x-amz-json-1.0', 'x-amz-target': 'DynamoDB_20120810.' + op }));
  const t = await r.text();"""
new="""  // 25.11 (задание 121): база Яндекса иногда рвёт первое соединение («fetch failed») или отвечает 5xx — повтор до 3 раз
  let r, t, err;
  for (let a = 0; a < 3; a++) {
    if (a) await new Promise(z => setTimeout(z, 200 * a));
    try {
      r = await fetch(ENV.DOCAPI, signedFetchArgs(ENV.DOCAPI, 'dynamodb', body, {
        'content-type': 'application/x-amz-json-1.0', 'x-amz-target': 'DynamoDB_20120810.' + op }));
      t = await r.text(); err = null;
      if (r.status >= 500 && a < 2) { err = new Error('db ' + op + ' ' + r.status); continue; }
      break;
    } catch (e) { err = e; r = null; }
  }
  if (!r) throw err;"""
assert s.count(old)==1, 'old not found'
open(p,'w').write(s.replace(old,new)); print('patched')
