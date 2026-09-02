#!/usr/bin/env node
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { isFactoredLoad } = require('./factoring.js');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const src = fs.readFileSync(path.join(__dirname, 'factoring.js'), 'utf8');

assert(
  html.includes('src="factoring.js"'),
  'index.html must load factoring.js — do not inline a second detector'
);
assert(
  !/\/amazon relay\/i\.test\(\s*c\s*\)/.test(html) && !/\/amazon relay\/i\.test\(\s*c\s*\)/.test(src),
  'forbidden: blanket /amazon relay/i.test(comments) exclude (zeros broker loads with Amazon deadhead notes)'
);

function yes(e, msg) {
  assert.strictEqual(isFactoredLoad(e), true, msg || JSON.stringify(e));
}
function no(e, msg) {
  assert.strictEqual(isFactoredLoad(e), false, msg || JSON.stringify(e));
}

yes(
  {
    source: 'BlueGrace Logistics',
    comments:
      'BlueGrace carrier load tender Highway RC ID 12186605. Deadhead from prior 2026-08-31 Amazon Relay 113XDFZRP drop',
  },
  'BlueGrace stays factored when notes mention prior Amazon deadhead'
);
yes(
  {
    source: 'D&L Transport',
    comments:
      'D&L Transport rate confirmation PRO #1974652. Deadhead from prior RYY2 drop (Amazon Relay 112F5C6TS)',
  },
  'D&L stays factored when notes mention prior Amazon deadhead'
);
yes(
  {
    source: 'GlobalTranz / Fila Freight',
    comments: 'Deadhead from Amazon Relay JAX9. rate confirmation on file',
  },
  'GlobalTranz stays factored with Amazon deadhead notes'
);
yes(
  {
    source: 'Ryder Freight Management Group',
    comments: 'prior Amazon Relay trip mentioned in deadhead',
  },
  'Ryder source is enough even without comment keywords'
);
yes(
  {
    source: 'PLS Logistics',
    comments: 'chained after Amazon Relay 116LP2W86',
  },
  'PLS source is enough'
);
yes({ source: 'DAT', comments: '' }, 'DAT source');
yes({ source: "Haul'N Loads", comments: '' }, "Haul'N source");
yes({ source: 'KCH Transportation', comments: '' }, 'KCH source');
yes({ source: 'Echo Global Logistics', comments: '' }, 'Echo source');
yes({ source: 'eShipping / Highway', comments: '' }, 'Highway source');

no(
  { source: 'Amazon Relay', comments: 'Amazon Relay spot trip 112F5C6TS. Highway RC ID should not matter' },
  'Amazon source never factors'
);
no({ source: 'Amazon Relay', comments: 'rate confirmation / broker wording in an Amazon comment' }, 'Amazon source beats comment keywords');
no({ source: 'Direct', comments: 'rate confirmation' }, 'Direct source never factors');
no({ source: '', comments: 'Amazon Relay spot trip ABC123' }, 'this-load Amazon trip with no source');
no({ source: 'App Delivery', comments: 'App delivery detail del_36LCPYC43V' }, 'App Delivery is not DAT factoring');
no({ source: '', comments: 'local cash job, no paperwork' }, 'unknown local');

const seeds = [];
const chunkStart = html.indexOf('const SEEDS=');
const chunkEnd = html.indexOf('const IFTA_BY_ID');
assert(chunkStart >= 0 && chunkEnd > chunkStart, 'SEEDS block');
const chunk = html.slice(chunkStart, chunkEnd);
for (const m of chunk.matchAll(/\{\s*(?:"id"|id):/g)) {
  let i = m.index;
  let depth = 0;
  let end = -1;
  for (let j = i; j < chunk.length; j++) {
    if (chunk[j] === '{') depth++;
    else if (chunk[j] === '}') {
      depth--;
      if (depth === 0) {
        end = j + 1;
        break;
      }
    }
  }
  if (end < 0) continue;
  const raw = chunk.slice(i, end);
  const grab = (key) => {
    const mm = raw.match(new RegExp('["\']?' + key + '["\']?\\s*:\\s*("(?:\\\\.|[^"\\\\])*"|null|[0-9.]+)'));
    if (!mm || mm[1] === 'null') return '';
    if (mm[1].startsWith('"')) return JSON.parse(mm[1]);
    return mm[1];
  };
  seeds.push({
    id: grab('id'),
    date: grab('date'),
    source: grab('source'),
    pay: parseFloat(grab('pay')) || 0,
    comments: grab('comments'),
  });
}

const sept = seeds.filter((e) => String(e.date).startsWith('2026-09'));
assert.strictEqual(sept.length, 3, 'expected 3 September loads, got ' + sept.length);
const bySrc = Object.fromEntries(sept.map((e) => [e.source, e]));
yes(bySrc['BlueGrace Logistics'], 'Sept BlueGrace');
no(bySrc['Amazon Relay'], 'Sept Amazon');
yes(bySrc['D&L Transport'], 'Sept D&L');

for (const e of seeds) {
  if (/\bamazon/i.test(e.source)) {
    no(e, 'seed Amazon must not factor: ' + e.date + ' ' + e.source);
  }
}

const factoredSept = sept.filter(isFactoredLoad);
const gross = factoredSept.reduce((s, e) => s + e.pay, 0);
assert.strictEqual(gross, 2350, 'September factored gross should be 1750+600, got ' + gross);

console.log('test_factoring.js ok — %d seed loads, %d September factored', seeds.length, factoredSept.length);
