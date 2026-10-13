import { describe, expect, it } from 'vitest'
import zh from '../instr/zh.js'
import en from '../instr/en.js'
import names from '../exercise-names/zh.js'
import source from '../../../catalogue/i18n/zh.json'

describe('context-authored Chinese exercise teaching', () => {
  it('ships exactly the canonical Chinese source, with complete steps for every authored exercise', () => {
    const translated = Object.fromEntries(Object.entries(source).filter(([, row]) => row.instructions?.length).map(([id, row]) => [id, row.instructions]))
    expect(zh).toEqual(translated)
    for (const [id, steps] of Object.entries(zh)) {
      expect(en[id], id).toBeTruthy()
      expect(steps.length, id).toBe(en[id].length)
      for (const step of steps) {
        expect(step.trim(), id).not.toBe('')
        expect(step, id).toMatch(/[\u3400-\u9fff]/u)
        expect(step, id).not.toMatch(/[▁�]/u)
      }
    }
  })

  it('uses posture and target-muscle context rather than misleading literal exercise names', () => {
    expect(names['0614']).toContain('俯卧')
    expect(zh['0614'][0]).toContain('俯卧')
    expect(names['0617']).toContain('侧卧')
    expect(zh['0617'][0]).toContain('侧躺')
    expect(names['0903']).toContain('臂后伸')
    expect(zh['0903'][2]).toContain('双手')
    expect(zh['0903'][3]).toContain('肱三头肌')
    expect(names['1042']).toContain('俯卧')
    expect(zh['1042'][0]).toContain('俯卧')
    expect(names['1048']).toContain('侧卧')
    expect(zh['1048'][0]).toContain('侧卧')
    expect(names['11047']).toContain('侧卧')
    expect(zh['11047'][0]).toContain('侧卧')
    expect(names['1776']).toContain('俯卧')
    expect(zh['1776'][0]).toContain('俯卧')
  })

  it('does not turn a stopped bench press or front raise into an unsupported throw', () => {
    expect(names['10559']).not.toContain('接住')
    expect(names['10560']).not.toContain('接住')
    expect(zh['10559'].join(' ')).not.toMatch(/抛|扔|松手/u)
    expect(zh['10560'][3]).toContain('停住')
    expect(zh['10560'].join(' ')).not.toMatch(/抛|扔|松手/u)
  })

  it('distinguishes stepping off a box, stepping up, and squatting with a raised front foot', () => {
    expect(names['10160']).toContain('下箱')
    expect(zh['10160'].join(' ')).toMatch(/不要.*跳/u)
    expect(names['11568']).toContain('前脚垫高')
    expect(zh['11568'][0]).toContain('前脚')
    expect(zh['11568'][1]).toContain('后脚')
    expect(names['1698']).toContain('双脚')
    expect(zh['1698'][0]).toContain('双脚')
  })
})
