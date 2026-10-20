const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8');
const body=html.slice(html.indexOf('  const loadLocal=()=>{'),html.indexOf('  const loadSupa=async'));
const seeds=html.match(/const MAINT_SEEDS=([^;]+);/)?.[0]||'const MAINT_SEEDS=[];';
function load(saved){let result=[];const ctx={sg:k=>k==='gg-ml'?saved:null,ss:()=>{},SEEDS:[],setLog:()=>{},setMaintLog:v=>result=v};vm.runInNewContext(seeds+body+'loadLocal();',ctx);return result;}
const rows=load(null);
assert.equal(rows.length,2,'Fresh phone must show July recovery and the confirmed PM');
const july=rows.find(r=>r.id==='recovered-pm-20260720');
assert.equal(july.date,'2026-07-20');assert.equal(july.mileage,214886);assert.equal(july.cost,463);assert.match(july.notes,/air filter/i);
const pm=rows.find(r=>r.id==='owner-pm-20261020');
assert.equal(pm.date,'2026-10-20');assert.equal(pm.type,'Oil Change');assert.equal(pm.mileage,229418);assert.equal(pm.cost,null);
assert.doesNotMatch(pm.notes,/air filter/i,'New PM must not reset the air-filter interval');
assert.equal(load([]).length,0,'Explicitly cleared local history stays cleared');
const kept=load([{id:99,cost:55}]);
assert.equal(kept[0].id,99,'Existing local history is preserved');
assert.equal(kept.filter(r=>r.id==='owner-pm-20261020').length,1,'Saved local history still receives the confirmed PM');
assert.equal(load([{id:'owner-pm-20261020',mileage:229418}]).filter(r=>r.id==='owner-pm-20261020').length,1,'Confirmed PM is not duplicated');
console.log('PASS: fresh-phone recovery, confirmed PM, existing local history, explicit empty history');
