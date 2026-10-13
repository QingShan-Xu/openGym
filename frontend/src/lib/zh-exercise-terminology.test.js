import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { EXIDX, searchExercises } from './exercises.js'
import { _setLangState, exerciseNameFor, exerciseNameSearchText } from './i18n-core.js'
import names from '../exercise-names/zh.js'
import dict from '../locales/zh.js'

beforeEach(() => _setLangState('zh', dict, null, names, false))
afterEach(() => _setLangState('en', {}, null, null))
const ids = (list, q) => searchExercises(list.map(id => EXIDX[id]), q).map(ex => ex.id)

describe('Chinese exercise terminology and discovery', () => {
  it('distinguishes an archer push-up from a lunge push-up, and a bicycle crunch from a bike', () => {
    expect(ids(['3294', '0611'], '射箭式俯卧撑')).toEqual(['3294'])
    expect(ids(['3294', '0611'], '弓箭手式俯卧撑')).toEqual(['3294'])
    expect(ids(['3294', '0611'], '弓步俯卧撑')).toEqual(['0611'])
    expect(ids(['0003', '3893'], '自行车卷腹')).toEqual(['0003'])
    expect(ids(['0003', '3893'], '风阻单车')).toEqual(['3893'])
  })

  it('finds common equivalent gym names while retaining equipment and posture constraints', () => {
    expect(ids(['0070', '0293'], '杠铃 斯科特')).toEqual(['0070'])
    expect(ids(['0070', '0293'], '哑铃 斯科特')).toEqual([])
    expect(ids(['0070'], '托臂弯举')).toEqual(['0070'])
    expect(ids(['0070'], 'preacher curl')).toEqual(['0070'])
    expect(ids(['0060', '0035'], '下斜 仰卧臂屈伸')).toEqual(['0035'])
    expect(exerciseNameFor(EXIDX['0060'])).toBe('杠铃仰卧臂屈伸')
    expect(exerciseNameSearchText(EXIDX['0060'])).not.toContain('颅骨')
  })

  it('keeps full clean-and-jerk, a shallow snatch and a no-dip snatch distinct', () => {
    expect(ids(['5122', '5190', '1530', '1526'], '杠铃 挺举')).toEqual(expect.arrayContaining(['5122', '5190']))
    expect(ids(['1530', '1526'], '高抓')).toEqual(['1530'])
    expect(ids(['1530', '1526'], '实力抓举')).toEqual(['1526'])
    expect(exerciseNameFor(EXIDX['5190'])).toContain('版本2')
    expect(exerciseNameFor(EXIDX['7384'])).toContain('挂片式')
    expect(exerciseNameFor(EXIDX['7384'])).not.toContain('插片式')
  })

  it('does not give another language or a custom exercise a built-in Chinese synonym', () => {
    _setLangState('en', {}, null, null)
    expect(ids(['0070'], '斯科特')).toEqual([])
    _setLangState('zh', dict, null, names, false)
    const custom = { ...EXIDX['0070'], custom: true, n: 'my curl' }
    expect(exerciseNameSearchText(custom)).not.toContain('斯科特')
    const shadow = { ...EXIDX['0070'], n: 'different move' }
    expect(exerciseNameSearchText(shadow)).not.toContain('斯科特')
    expect(exerciseNameSearchText(null)).toBe('')
    expect(exerciseNameSearchText({ id: 'missing' })).toBe('')
  })
})
