import api from './client'

export interface ChatGPTPlusSubmitPayload {
    card_key: string
    access_token: string
}

export interface ChatGPTPlusJobRecord {
    job_id?: string
    status?: string
    message?: string
    card_key?: string
    product_line?: string
    activation_email?: string
    plan_name?: string
    created_at?: number
    duplicate?: boolean
    [key: string]: any
}

export interface ChatGPTPlusByCardKeyResp {
    card_key?: string
    product_line?: string
    total?: number
    records?: ChatGPTPlusJobRecord[]
    [key: string]: any
}

export async function submitChatGPTPlusRecharge(payload: ChatGPTPlusSubmitPayload): Promise<ChatGPTPlusJobRecord> {
    const resp = await api.post('/public/recharge/chatgpt-plus/submit', payload)
    return resp.data.data
}

export async function queryChatGPTPlusRechargeByCardKey(cardKey: string): Promise<ChatGPTPlusByCardKeyResp> {
    const resp = await api.get('/public/recharge/chatgpt-plus/by-card-key', {
        params: { card_key: cardKey },
    })
    return resp.data.data
}
