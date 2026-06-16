<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
    queryChatGPTPlusRechargeByCardKey,
    submitChatGPTPlusRecharge,
    type ChatGPTPlusByCardKeyResp,
    type ChatGPTPlusJobRecord,
} from '../api/recharge'

const route = useRoute()

const cardKey = ref('')
const accessToken = ref('')
const submitting = ref(false)
const querying = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const submitResult = ref<ChatGPTPlusJobRecord | null>(null)
const queryResult = ref<ChatGPTPlusByCardKeyResp | null>(null)

const latestRecord = computed(() => {
    const records = queryResult.value?.records || []
    return records.length > 0 ? records[0] : submitResult.value
})

const statusText = (status?: string) => {
    switch (status) {
        case 'queued': return '排队中'
        case 'running': return '处理中'
        case 'success': return '充值成功'
        case 'failed': return '充值失败'
        case 'cancelled': return '已取消'
        default: return status || '未知'
    }
}

const statusClass = (status?: string) => {
    switch (status) {
        case 'success': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        case 'failed': return 'bg-red-100 text-red-700 border-red-200'
        case 'cancelled': return 'bg-slate-100 text-slate-700 border-slate-200'
        case 'queued':
        case 'running':
            return 'bg-sky-100 text-sky-700 border-sky-200'
        default:
            return 'bg-amber-100 text-amber-700 border-amber-200'
    }
}

const clearNotice = () => {
    errorMessage.value = ''
    successMessage.value = ''
}

const normalize = () => {
    cardKey.value = cardKey.value.trim()
    accessToken.value = accessToken.value.trim()
}

const handleSubmit = async () => {
    clearNotice()
    normalize()

    if (!cardKey.value) {
        errorMessage.value = '请输入从 Viva 小铺购买到的 ChatGPT Plus 卡密'
        return
    }
    if (!accessToken.value) {
        errorMessage.value = '请输入 ChatGPT AccessToken'
        return
    }

    submitting.value = true
    try {
        const data = await submitChatGPTPlusRecharge({
            card_key: cardKey.value,
            access_token: accessToken.value,
        })
        submitResult.value = data
        queryResult.value = null
        accessToken.value = ''
        successMessage.value = '已提交充值任务，请等待处理完成。为保护账号安全，页面不会保存 AccessToken。'
    } catch (err: any) {
        errorMessage.value = err?.message || '提交失败，请稍后重试'
    } finally {
        submitting.value = false
    }
}

const handleQuery = async () => {
    clearNotice()
    cardKey.value = cardKey.value.trim()
    if (!cardKey.value) {
        errorMessage.value = '请输入要查询的卡密'
        return
    }

    querying.value = true
    try {
        queryResult.value = await queryChatGPTPlusRechargeByCardKey(cardKey.value)
        if ((queryResult.value.records || []).length === 0) {
            successMessage.value = '暂未查询到该卡密的充值任务。若刚刚提交，请稍后刷新查询。'
        }
    } catch (err: any) {
        errorMessage.value = err?.message || '查询失败，请稍后重试'
    } finally {
        querying.value = false
    }
}

onMounted(() => {
    const fromQuery = route.query.card_key
    if (typeof fromQuery === 'string') {
        cardKey.value = fromQuery
    }
})
</script>

<template>
    <main class="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div class="mx-auto max-w-5xl px-4">
            <section class="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-800 p-6 text-white shadow-xl sm:p-10">
                <p class="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">Viva 小铺</p>
                <h1 class="mt-3 text-3xl font-black sm:text-4xl">ChatGPT Plus 官方直充兑换</h1>
                <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                    输入你在 Viva 小铺购买到的卡密，并粘贴 ChatGPT AccessToken。提交后系统会自动调用上游直充接口处理。
                </p>
            </section>

            <div class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <h2 class="text-xl font-bold text-slate-900">提交兑换</h2>
                    <p class="mt-2 text-sm text-slate-500">API Key 仅保存在服务器端，浏览器不会接触上游密钥。</p>

                    <div v-if="errorMessage" class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {{ errorMessage }}
                    </div>
                    <div v-if="successMessage" class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {{ successMessage }}
                    </div>

                    <form class="mt-6 space-y-5" @submit.prevent="handleSubmit">
                        <label class="block">
                            <span class="text-sm font-semibold text-slate-700">卡密</span>
                            <input
                                v-model="cardKey"
                                class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                placeholder="请输入购买到的 ChatGPT Plus 卡密"
                                autocomplete="off"
                            />
                        </label>

                        <label class="block">
                            <span class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span class="text-sm font-semibold text-slate-700">ChatGPT AccessToken</span>
                                <a
                                    href="https://chatgpt.com/api/auth/session"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
                                >
                                    获取Token
                                </a>
                            </span>
                            <p class="mt-2 text-xs leading-5 text-slate-500">
                                请先登录 ChatGPT，点击“获取Token”打开官方 session 页面，复制返回 JSON 中的 accessToken 后粘贴到下方。
                            </p>
                            <textarea
                                v-model="accessToken"
                                class="mt-2 min-h-36 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                placeholder="粘贴 ChatGPT AccessToken，通常以 eyJ... 开头"
                                autocomplete="off"
                            />
                        </label>

                        <div class="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="submit"
                                :disabled="submitting"
                                class="inline-flex flex-1 items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {{ submitting ? '正在提交...' : '提交充值' }}
                            </button>
                            <button
                                type="button"
                                :disabled="querying"
                                class="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                @click="handleQuery"
                            >
                                {{ querying ? '正在查询...' : '按卡密查询状态' }}
                            </button>
                        </div>
                    </form>
                </section>

                <aside class="space-y-6">
                    <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <h2 class="text-xl font-bold text-slate-900">充值状态</h2>
                        <div v-if="latestRecord" class="mt-5 space-y-3 text-sm">
                            <div class="flex items-center justify-between gap-3">
                                <span class="text-slate-500">状态</span>
                                <span :class="['rounded-full border px-3 py-1 font-bold', statusClass(latestRecord.status)]">
                                    {{ statusText(latestRecord.status) }}
                                </span>
                            </div>
                            <div v-if="latestRecord.job_id" class="rounded-2xl bg-slate-50 p-3">
                                <div class="text-slate-500">任务编号</div>
                                <div class="mt-1 break-all font-mono text-slate-800">{{ latestRecord.job_id }}</div>
                            </div>
                            <div v-if="latestRecord.message" class="rounded-2xl bg-slate-50 p-3">
                                <div class="text-slate-500">上游消息</div>
                                <div class="mt-1 text-slate-800">{{ latestRecord.message }}</div>
                            </div>
                            <div v-if="latestRecord.activation_email" class="rounded-2xl bg-slate-50 p-3">
                                <div class="text-slate-500">充值账号</div>
                                <div class="mt-1 break-all text-slate-800">{{ latestRecord.activation_email }}</div>
                            </div>
                            <div v-if="latestRecord.plan_name" class="rounded-2xl bg-slate-50 p-3">
                                <div class="text-slate-500">套餐</div>
                                <div class="mt-1 text-slate-800">{{ latestRecord.plan_name }}</div>
                            </div>
                        </div>
                        <p v-else class="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                            提交兑换或输入卡密查询后，这里会显示排队中、处理中、成功或失败状态。
                        </p>
                    </section>

                    <section class="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800 shadow-sm sm:p-7">
                        <h2 class="text-lg font-bold">安全提示</h2>
                        <ul class="mt-3 list-disc space-y-2 pl-5">
                            <li>请确认卡密来自 Viva 小铺已付款订单。</li>
                            <li>AccessToken 属于敏感信息，提交后本页面会立即清空输入框。</li>
                            <li>请勿把卡密、Token 发给陌生人，避免账号与订单风险。</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </div>
    </main>
</template>
