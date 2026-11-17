const handler = require('./tmp_ask.cjs').default
const headers = {}
const res = {
  setHeader: (k, v) => { headers[k] = v },
  status(code) { return { json: (b) => { console.log('STATUS', code); console.log('BODY', JSON.stringify(b).slice(0, 300)) } } },
}
handler({ method: 'POST', body: { query: '体育馆怎么约' } }, res)
  .then(() => console.log('done'))
  .catch(e => { console.log('THREW:', e && e.stack ? e.stack.split('\n').slice(0,6).join('\n') : e) })
