export interface CardRedeemRule {
  prefix: string
  url: string
}

export const getCardRedeemURL = (raw: unknown): string => {
  if (typeof raw !== 'string' || !raw.trim()) return ''
  try {
    const parsed = new URL(raw.trim())
    return parsed.protocol === 'https:' && parsed.hostname && !parsed.username && !parsed.password
      ? parsed.href : ''
  } catch {
    return ''
  }
}

export const getCardRedeemRules = (raw: unknown): CardRedeemRule[] => {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return []
    const rule = item as Record<string, unknown>
    const prefix = typeof rule.prefix === 'string' ? rule.prefix.trim() : ''
    const url = getCardRedeemURL(rule.url)
    return prefix && url ? [{ prefix, url }] : []
  })
}

// Longer prefixes take precedence, independent of the administrator's row order.
export const matchCardRedeemRule = (code: string, rules: CardRedeemRule[]): CardRedeemRule | undefined => {
  const normalizedCode = code.trim().toUpperCase()
  let match: CardRedeemRule | undefined
  for (const rule of rules) {
    if (normalizedCode.startsWith(rule.prefix.toUpperCase()) && (!match || rule.prefix.length > match.prefix.length)) {
      match = rule
    }
  }
  return match
}
