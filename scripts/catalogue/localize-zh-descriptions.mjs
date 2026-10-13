#!/usr/bin/env node
// Chinese summaries from the catalogue's existing names, equipment and muscle
// metadata. This adds no technique or medical claims and never reads media.
// Existing hand-written descriptions are preserved.
import { readFileSync, writeFileSync } from 'node:fs'
import zh from '../../frontend/src/locales/zh.js'

const file = new URL('../../catalogue/i18n/zh.json', import.meta.url)
const rows = JSON.parse(readFileSync(file, 'utf8'))
const word = key => {
  if (!zh[key]) throw new Error(`Missing Chinese catalogue term: ${key}`)
  return zh[key]
}
let added = 0
for (const [id, translated] of Object.entries(rows)) {
  if (translated.description || !translated.name) continue
  const ex = JSON.parse(readFileSync(new URL(`../../catalogue/exercises/${id}.json`, import.meta.url), 'utf8'))
  translated.description = `${translated.name}属于${word(ex.bodyPart)}训练，使用${word(ex.equipment)}，主要锻炼${word(ex.target)}。`
    + (ex.secondaryMuscles.length ? `辅助训练肌群：${ex.secondaryMuscles.map(word).join('、')}。` : '')
  added++
}
writeFileSync(file, JSON.stringify(rows, null, 2) + '\n')
console.log(`Added ${added} Chinese exercise summaries; existing descriptions preserved.`)
