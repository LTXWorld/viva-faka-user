<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
    getGeminiRechargeBalance,
    queryGeminiRechargeStatus,
    submitGeminiRecharge,
    type GeminiTaskResp,
} from '../api/recharge'

const route = useRoute()

const cdkey = ref('')
const email = ref('')
const password = ref('')
const twofa = ref('')
const taskType = ref<'full' | 'extract'>('full')
const taskId = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const balance = ref<number | null>(null)
const result = ref<GeminiTaskResp | null>(null)

const statusData = computed(() => result.value?.data || result.value || {})

const statusText = (status?: string) => {
    const raw = String(status || '').toLowerCase()
    switch (raw) {
        case 'pending':
        case 'queued': return '排队中'
        case 'running':
        case 'processing': return '处理中'
        case 'success':
        case 'completed': return '成功'
        case 'failed': return '失败'
        case 'cancelled':
        case 'canceled': return '已取消'
        default: return status || '未知'
    }
}

const statusClass = (status?: string) => {
    const raw = String(status || '').toLowerCase()
    if (['success', 'completed'].includes(raw)) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (['failed'].includes(raw)) return 'bg-red-100 text-red-700 border-red-200'
    if (['cancelled', 'canceled'].includes(raw)) return 'bg-slate-100 text-slate-700 border-slate-200'
    if (['pending', 'queued', 'running', 'processing'].includes(raw)) return 'bg-sky-100 text-sky-700 border-sky-200'
    return 'bg-amber-100 text-amber-700 border-amber-200'
}

const clearNotice = () => {
    errorMessage.value = ''
    successMessage.value = ''
}

const normalize = () => {
    cdkey.value = cdkey.value.trim()
    email.value = email.value.trim()
    twofa.value = twofa.value.trim().replace(/\s+/g, '')
    taskId.value = taskId.value.trim()
}

const handleBalance = async () => {
    clearNotice()
    normalize()
    if (!cdkey.value) {
        errorMessage.value = '请输入 Gemini 卡密'
        return
    }
    loading.value = true
    try {
        const data = await getGeminiRechargeBalance(cdkey.value)
        balance.value = typeof data.remaining_uses === 'number' ? data.remaining_uses : null
        successMessage.value = '余额查询成功'
    } catch (err: any) {
        errorMessage.value = err?.message || '余额查询失败'
    } finally {
        loading.value = false
    }
}

const handleSubmit = async () => {
    clearNotice()
    normalize()
    if (!cdkey.value) {
        errorMessage.value = '请输入 Gemini 卡密'
        return
    }
    if (!email.value) {
        errorMessage.value = '请输入 Google 邮箱'
        return
    }
    loading.value = true
    try {
        const data = await submitGeminiRecharge({
            cdkey: cdkey.value,
            email: email.value,
            password: password.value,
            twofa: twofa.value,
            task_type: taskType.value,
        })
        result.value = data
        if (data.task_id) taskId.value = String(data.task_id)
        if (typeof data.remaining_uses === 'number') balance.value = data.remaining_uses
        password.value = ''
        successMessage.value = 'Gemini 任务已提交。为保护账号安全，页面不会保存密码。'
    } catch (err: any) {
        errorMessage.value = err?.message || '提交失败，请稍后重试'
    } finally {
        loading.value = false
    }
}

const handleQuery = async () => {
    clearNotice()
    normalize()
    if (!cdkey.value) {
        errorMessage.value = '请输入 Gemini 卡密'
        return
    }
    const parsedTaskId = Number(taskId.value)
    if (!taskId.value && !email.value) {
        errorMessage.value = '请输入 task_id 或 Google 邮箱用于查询'
        return
    }
    loading.value = true
    try {
        result.value = await queryGeminiRechargeStatus({
            cdkey: cdkey.value,
            task_id: Number.isFinite(parsedTaskId) && parsedTaskId > 0 ? parsedTaskId : undefined,
            email: email.value || undefined,
        })
        successMessage.value = '状态查询成功'
    } catch (err: any) {
        errorMessage.value = err?.message || '查询失败，请稍后重试'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    const key = route.query.cdkey || route.query.card_key
    if (typeof key === 'string') cdkey.value = key
})
</script>

<template>
    <main class="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div class="mx-auto max-w-5xl px-4">
            <section class="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-700 p-6 text-white shadow-xl sm:p-10">
                <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">Viva 小铺</p>
                <h1 class="mt-3 text-3xl font-black sm:text-4xl">Gemini 直充兑换</h1>
                <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                    输入你在 Viva 小铺购买到的 Gemini 卡密和 Google 账号信息，系统会自动提交到上游队列处理。
                </p>
            </section>

            <div class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <h2 class="text-xl font-bold text-slate-900">提交 Gemini 任务</h2>
                    <p class="mt-2 text-sm text-slate-500">卡密会先校验是否来自 Viva 小铺已付款订单。</p>

                    <div v-if="errorMessage" class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</div>
                    <div v-if="successMessage" class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ successMessage }}</div>

                    <form class="mt-6 space-y-5" @submit.prevent="handleSubmit">
                        <label class="block">
                            <span class="text-sm font-semibold text-slate-700">Gemini 卡密</span>
                            <input v-model="cdkey" class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" placeholder="请输入购买到的 Gemini 卡密" autocomplete="off" />
                        </label>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <label class="block">
                                <span class="text-sm font-semibold text-slate-700">Google 邮箱</span>
                                <input v-model="email" class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" placeholder="example@gmail.com" autocomplete="off" />
                            </label>
                            <label class="block">
                                <span class="text-sm font-semibold text-slate-700">任务类型</span>
                                <select v-model="taskType" class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100">
                                    <option value="full">完整订阅（扣 1 额度）</option>
                                    <option value="extract">仅提取链接（扣 0.5 额度）</option>
                                </select>
                            </label>
                        </div>

                        <label class="block">
                            <span class="text-sm font-semibold text-slate-700">Google 密码（可选）</span>
                            <input v-model="password" type="password" class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" placeholder="如上游任务需要，请填写" autocomplete="off" />
                        </label>

                        <label class="block">
                            <span class="text-sm font-semibold text-slate-700">2FA 密钥（可选）</span>
                            <input v-model="twofa" class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" placeholder="无空格专属密钥" autocomplete="off" />
                        </label>

                        <div class="flex flex-col gap-3 sm:flex-row">
                            <button type="submit" :disabled="loading" class="inline-flex flex-1 items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60">
                                {{ loading ? '处理中...' : '提交任务' }}
                            </button>
                            <button type="button" :disabled="loading" class="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" @click="handleBalance">
                                查询余额
                            </button>
                        </div>
                    </form>

                    <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h3 class="font-bold text-slate-900">查询任务状态</h3>
                        <div class="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                            <input v-model="taskId" class="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" placeholder="task_id；也可使用上方邮箱查询" />
                            <button type="button" :disabled="loading" class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60" @click="handleQuery">查询状态</button>
                        </div>
                    </div>
                </section>

                <aside class="space-y-6">
                    <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <h2 class="text-xl font-bold text-slate-900">任务结果</h2>
                        <div v-if="balance !== null" class="mt-5 rounded-2xl bg-cyan-50 p-4 text-cyan-800">
                            当前剩余额度：<strong>{{ balance }}</strong>
                        </div>
                        <div v-if="result" class="mt-5 space-y-3 text-sm">
                            <div v-if="statusData.status" class="flex items-center justify-between gap-3">
                                <span class="text-slate-500">状态</span>
                                <span :class="['rounded-full border px-3 py-1 font-bold', statusClass(statusData.status)]">{{ statusText(statusData.status) }}</span>
                            </div>
                            <div v-if="result.task_id || statusData.task_id" class="rounded-2xl bg-slate-50 p-3">
                                <div class="text-slate-500">任务编号</div>
                                <div class="mt-1 font-mono text-slate-800">{{ result.task_id || statusData.task_id }}</div>
                            </div>
                            <div v-if="result.message || statusData.message" class="rounded-2xl bg-slate-50 p-3">
                                <div class="text-slate-500">上游消息</div>
                                <div class="mt-1 text-slate-800">{{ result.message || statusData.message }}</div>
                            </div>
                            <div v-if="statusData.offer_url" class="rounded-2xl bg-slate-50 p-3">
                                <div class="text-slate-500">优惠链接</div>
                                <a class="mt-1 block break-all text-cyan-700 underline" :href="statusData.offer_url" target="_blank" rel="noopener noreferrer">{{ statusData.offer_url }}</a>
                            </div>
                        </div>
                        <p v-else class="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">提交或查询后，这里会显示任务状态、任务编号和上游消息。</p>
                    </section>

                    <section class="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800 shadow-sm sm:p-7">
                        <h2 class="text-lg font-bold">安全提示</h2>
                        <ul class="mt-3 list-disc space-y-2 pl-5">
                            <li>请确认卡密来自 Viva 小铺已付款订单。</li>
                            <li>Google 密码和 2FA 属于敏感信息，请确认授权后再提交。</li>
                            <li>提交成功后页面会清空密码输入框，但上游执行任务仍可能需要使用你提交的信息。</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </div>
    </main>
</template>
