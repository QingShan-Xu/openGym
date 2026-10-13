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
  })
})
