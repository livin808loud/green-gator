const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8');
const body=html.slice(html.indexOf('  const loadLocal=()=>{'),html.indexOf('  const loadSupa=async'));
const seeds=html.match(/const MAINT_SEEDS=([^;]+);/)?.[0]||'const MAINT_SEEDS=[];';
function load(saved){let result=[];const ctx={sg:k=>k==='gg-ml'?saved:null,ss:()=>{},SEEDS:[],setLog:()=>{},setMaintLog:v=>result=v};vm.runInNewContext(seeds+body+'loadLocal();',ctx);return result;}
const rows=load(null);assert.equal(rows.length,1,'Fresh phone must show recovered service');
assert.equal(rows[0].date,'2026-07-20');assert.equal(rows[0].mileage,214886);assert.equal(rows[0].cost,463);assert.match(rows[0].notes,/air filter/i);
assert.equal(load([]).length,0,'Explicitly cleared local history stays cleared');
assert.equal(load([{id:99,cost:55}])[0].id,99,'Existing local history is preserved');
console.log('PASS: fresh-phone recovery, corrected mileage/cost, existing local history, explicit empty history');
