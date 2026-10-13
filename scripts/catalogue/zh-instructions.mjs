#!/usr/bin/env node
// Batch staging/validation only. No translator, network call, model API or media access.
// The assistant authors Chinese from each exercise's full textual context.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const path = resolve(root, 'catalogue/i18n/zh.json')
const zh = JSON.parse(readFileSync(path, 'utf8'))
const exs = readdirSync(resolve(root, 'catalogue/exercises')).sort()
  .map(f => JSON.parse(readFileSync(resolve(root, 'catalogue/exercises', f), 'utf8')))
  .filter(e => !e.variantOf)
const byId = new Map(exs.map(e => [e.id, e]))
const pending = exs.filter(e => !zh[e.id]?.instructions?.length)
const command = process.argv[2] || 'status'
const counts = () => ({ total: exs.length, translated: exs.length - pending.length, pending: pending.length })
if (command === 'status') {
  console.log(JSON.stringify(counts()))
} else if (command === 'next') {
  const limit = Number(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || 40)
  console.log(JSON.stringify({ ...counts(), exercises: pending.slice(0, limit).map(e => ({
    id: e.id, name: e.name, chineseName: zh[e.id]?.name, category: e.category,
    equipment: e.equipment, target: e.target, description: e.description, instructions: e.instructions,
  })) }, null, 2))
} else if (command === 'apply') {
  const batch = JSON.parse(readFileSync(process.argv[3], 'utf8'))
  if (!batch || Array.isArray(batch) || typeof batch !== 'object') throw new Error('Expected { id: [Chinese steps] }')
  const errors = []
  const numbers = s => [...s.matchAll(/\d+(?:\.\d+)?/g)].map(m => m[0]).sort().join('|')
  for (const [id, steps] of Object.entries(batch)) {
    const e = byId.get(id)
    if (!e || !zh[id]) { errors.push(`${id}: unknown exercise`); continue }
    if (zh[id].instructions?.length) { errors.push(`${id}: already translated; refusing overwrite`); continue }
    if (!Array.isArray(steps) || steps.length !== e.instructions.length) { errors.push(`${id}: step count mismatch`); continue }
    steps.forEach((s, i) => {
      if (typeof s !== 'string' || !s.trim() || s !== s.trim() || !/[\u3400-\u9fff]/u.test(s)) errors.push(`${id}/${i}: not a Chinese step`)
      else {
        if (s === e.instructions[i] || /[▁�]|\{\d+\}/u.test(s)) errors.push(`${id}/${i}: invalid translation residue`)
        if (numbers(s) !== numbers(e.instructions[i])) errors.push(`${id}/${i}: numbers differ: ${e.instructions[i]} => ${s}`)
      }
    })
  }
  if (errors.length) throw new Error(errors.join('\n'))
  if (!Object.keys(batch).length) throw new Error('Empty batch')
  for (const [id, instructions] of Object.entries(batch)) zh[id].instructions = instructions
  writeFileSync(path, JSON.stringify(zh, null, 2) + '\n')
  console.log(JSON.stringify({ applied: Object.keys(batch).length, translated: exs.length - pending.length + Object.keys(batch).length, total: exs.length }))
} else if (command === 'check') {
  const errors = []
  for (const e of exs) {
    const steps = zh[e.id]?.instructions
    if (!steps?.length) { errors.push(`${e.id}: untranslated`); continue }
    if (steps.length !== e.instructions.length) errors.push(`${e.id}: step count mismatch`)
    steps.forEach((s, i) => { if (!/[\u3400-\u9fff]/u.test(s) || s === e.instructions[i]) errors.push(`${e.id}/${i}: untranslated step`) })
  }
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
  else console.log(`Chinese instructions: ${exs.length}/${exs.length} exercises covered.`)
} else throw new Error(`Unknown command: ${command}`)
