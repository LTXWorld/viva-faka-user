import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getCardRedeemRules, getCardRedeemURL, matchCardRedeemRule } from '../src/utils/cardRedeem.ts'

test('matches prefixes case-insensitively and prefers the longest in either row order', () => {
  const rules = getCardRedeemRules([
    { prefix: 'A', url: 'https://example.com/a' },
    { prefix: 'AB', url: 'https://example.com/b' },
  ])
  assert.equal(matchCardRedeemRule(' ab123 ', rules)?.url, 'https://example.com/b')
  assert.equal(matchCardRedeemRule('ab123', [...rules].reverse())?.url, 'https://example.com/b')
  assert.equal(matchCardRedeemRule('a123', rules)?.url, 'https://example.com/a')
  assert.equal(matchCardRedeemRule('XAB123', rules), undefined)
  assert.equal(matchCardRedeemRule('', rules), undefined)
})

test('replacing a URL applies to the same existing card code', () => {
  const code = 'A-sold-card'
  assert.equal(matchCardRedeemRule(code, [{ prefix: 'A', url: 'https://old.example.com' }])?.url, 'https://old.example.com')
  assert.equal(matchCardRedeemRule(code, [{ prefix: 'A', url: 'https://new.example.com' }])?.url, 'https://new.example.com')
})

test('filters malformed rules and rejects unsafe URL schemes and credentials', () => {
  for (const url of ['http://example.com', '/redeem', 'javascript:alert(1)', 'https://user:password@example.com', 'https://:443']) {
    assert.equal(getCardRedeemURL(url), '')
  }
  assert.deepEqual(getCardRedeemRules(null), [])
  assert.deepEqual(getCardRedeemRules([null, true, {}, { prefix: ' ', url: 'https://example.com' }, { prefix: 'A', url: 'javascript:alert(1)' }]), [])
  assert.deepEqual(getCardRedeemRules([{ prefix: ' A ', url: ' https://example.com/redeem ' }]), [{ prefix: 'A', url: 'https://example.com/redeem' }])
})
