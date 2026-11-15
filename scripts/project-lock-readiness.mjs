#!/usr/bin/env node
// Project Lock readiness: conservative evidence-based scoring. Never deploys.
import fs from 'node:fs';
const file = new URL('../release-readiness.json', import.meta.url);
const input = JSON.parse(fs.readFileSync(file, 'utf8'));
const allowed = new Set(['verified','pending','blocked']);
const total = input.gates.reduce((sum, g) => {
  if (!Number.isInteger(g.weight) || g.weight <= 0 || !allowed.has(g.status) || !g.id) throw Error('Invalid gate');
  if (g.status === 'verified' && (!g.evidence || !g.evidence.trim())) throw Error('Verified gate requires evidence');
  return sum + g.weight;
}, 0);
if (total !== 100 || new Set(input.gates.map(g=>g.id)).size !== input.gates.length) throw Error('Gate weights must total 100 and IDs be unique');
const score = input.gates.filter(g=>g.status==='verified').reduce((sum,g)=>sum+g.weight,0);
const blockers = input.gates.filter(g=>g.critical && g.status!=='verified');
const ready = score===100 && blockers.length===0;
const result = {project:input.project,score,maxScore:100,ready,criticalBlockers:blockers.map(g=>({id:g.id,status:g.status,title:g.title})),gates:input.gates};
console.log(JSON.stringify(result,null,2));
const lines = ['# Project Lock — Release Readiness', '', '**Project:** '+input.project,'**Score:** '+score+'/100','**Release ready:** '+(ready?'YES':'NO'),'', '| Gate | Weight | Status | Evidence |','|---|---:|---|---|',...input.gates.map(g=>'| '+g.title.replaceAll('|','/')+' | '+g.weight+' | '+g.status+' | '+(g.evidence||'Not verified').replaceAll('|','/')+' |'),'', '**Critical blockers:** '+blockers.length, ...blockers.map(g=>'- '+g.title+' ('+g.status+')'),'', 'A green CI run does not by itself approve a release. Verified status requires attributable evidence for the selected candidate.'];
fs.mkdirSync('project-lock-output',{recursive:true});
fs.writeFileSync('project-lock-output/RELEASE_READINESS.md',lines.join('\n')+'\n');
fs.writeFileSync('project-lock-output/readiness.json',JSON.stringify(result,null,2)+'\n');
