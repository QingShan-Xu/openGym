// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { URL as FileURL } from 'node:url'
import { runInNewContext } from 'node:vm'
import { setLang, t, dateLocale, exerciseNameFor, instrFor, descFor } from './i18n.js'
import { serverErrorMessage, api } from './api.js'
import { auditLine } from './audit.js'
import { effectiveLang } from './default-lang.js'
import { EXDB } from './exercises-data.js'
import zh from '../locales/zh.js'
import operator from '../operator-locales/zh.js'
import names from '../exercise-names/zh.js'

afterEach(async () => { vi.unstubAllGlobals(); localStorage.clear(); await setLang('en') })

describe('Chinese distribution', () => {
  it('loads user and operator translations, Chinese dates and Chinese-only exercise names', async () => {
    await setLang('zh', false)
    expect(t('Settings')).toBe('设置')
    expect(t('Invite codes')).toBe('邀请码')
    expect(t('Reset {0}’s password?', '小明')).toBe('重置 小明 的密码？')
    expect(dateLocale()).toBe('zh-CN')
    const ex = EXDB.find(e => e.id === '0025')
    expect(exerciseNameFor(ex)).toBe(names[ex.id])
    expect(instrFor(ex).every(s => /[\u3400-\u9fff]/.test(s))).toBe(true)
    // Descriptions are lazy; wait for the actual Chinese chunk, not a fixed delay.
    await vi.waitFor(() => expect(descFor(ex)).toContain('主要锻炼'))
  })

  it('has a Chinese name for every catalogue exercise', () => {
    expect(EXDB.filter(e => !names[e.id])).toEqual([])
  })

  it('keeps every operator placeholder and rejects blank translations', () => {
    const marks = s => [...s.matchAll(/\{\d+\}/g)].map(m => m[0]).sort()
    for (const [key, value] of Object.entries(operator)) {
      expect(value.trim(), key).not.toBe('')
      expect(marks(value), key).toEqual(marks(key))
    }
  })

  it('translates audit events, reasons and actions without changing protocol identifiers', async () => {
    await setLang('zh', false)
    expect(auditLine({ ev: 'auth.pair.fail', ok: false, msg: 'code-invalid' })).toEqual({
      title: '配对失败', sub: '未知访问者 · 配对码错误或已过期',
    })
    expect(auditLine({ ev: 'auth.proof.fail', ok: false, act: 'password' }).sub).toContain('设置或修改密码')
    expect(auditLine({ ev: 'auth.future.event', ok: true }).title).toBe('auth.future.event')
    await setLang('en')
    expect(auditLine({ ev: 'auth.pair.fail', ok: false, msg: 'code-invalid' }).title).toBe('Pairing failed')
  })

  it('localizes server errors while preserving status and conflict payloads', async () => {
    await setLang('zh', false)
    expect(serverErrorMessage('the password needs at least 12 characters')).toBe('密码至少需要 12 个字符')
    const body = { error: 'conflict', state: { lang: 'en' }, rev: 7 }
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 409, json: async () => body })))
    await expect(api('/api/data')).rejects.toMatchObject({ message: '数据发生冲突，请同步后重试', status: 409, data: body })
  })

  it('covers every literal server error rather than showing untranslated login failures', () => {
    const source = readFileSync(new FileURL('../../../api/server.js', import.meta.url), 'utf8')
    const errors = [...source.matchAll(/error:\s*'([^']+)'/g)].map(m => m[1])
    expect(errors.length).toBeGreaterThan(40)
    expect(errors.filter(key => !(zh[key] || operator[key]))).toEqual([])
  })

  it('defaults to Chinese but preserves an explicit language choice and instance override', () => {
    expect(effectiveLang({ lang: 'zh', langAuto: true }, {}, ['en-US'])).toBe('zh')
    expect(effectiveLang({ lang: 'zh', langAuto: true }, { default_lang: 'zh-TW' }, ['en-US'])).toBe('zh-TW')
    expect(effectiveLang({ lang: 'en', langAuto: false }, { default_lang: 'zh' })).toBe('en')
  })

  it('sets the correct HTML language before paint, including cached instance defaults', () => {
    const html = readFileSync(new FileURL('../../index.html', import.meta.url), 'utf8')
    const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
    const langAtBoot = (saved, cache) => {
      const document = { documentElement: { lang: 'zh-CN' } }
      runInNewContext(script, { document, localStorage: { getItem: key => key === 'gym_state_v1' ? JSON.stringify(saved) : cache } })
      return document.documentElement
    }
    expect(langAtBoot({}, null)).toEqual({ lang: 'zh', dir: 'ltr' })
    expect(langAtBoot({ lang: 'en' }, 'zh')).toEqual({ lang: 'en', dir: 'ltr' })
    expect(langAtBoot({ lang: 'zh', langAuto: true }, 'ar')).toEqual({ lang: 'ar', dir: 'rtl' })
  })
})
