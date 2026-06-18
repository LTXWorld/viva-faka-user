<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolveRechargeCard, type RechargeResolveResp } from '../api/recharge'

const route = useRoute()
const router = useRouter()

const cardKey = ref('')
const loading = ref(false)
const errorMessage = ref('')
const result = ref<RechargeResolveResp | null>(null)

const handleResolve = async () => {
    errorMessage.value = ''
    result.value = null
    cardKey.value = cardKey.value.trim()
    if (!cardKey.value) {
        errorMessage.value = '请输入卡密'
        return
    }
    loading.value = true
    try {
        const data = await resolveRechargeCard(cardKey.value)
        result.value = data
        if (data.redeem_mode === 'api' && data.target_path) {
            await router.push(data.target_path)
        }
    } catch (err: any) {
        errorMessage.value = err?.message || '识别失败，请稍后重试'
    } finally {
        loading.value = false
    }
}

const goTarget = () => {
    if (result.value?.target_path) {
        router.push(result.value.target_path)
    }
}

onMounted(() => {
    const key = route.query.card_key || route.query.cdkey
    if (typeof key === 'string') {
        cardKey.value = key
        void handleResolve()
    }
})
</script>

<template>
    <main class="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div class="mx-auto max-w-3xl px-4">
            <section class="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-700 p-6 text-white shadow-xl sm:p-10">
                <p class="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">Viva 小铺</p>
                <h1 class="mt-3 text-3xl font-black sm:text-4xl">统一卡密兑换入口</h1>
                <p class="mt-4 text-sm leading-7 text-slate-200 sm:text-base">
                    输入你在 Viva 小铺购买到的卡密，系统会自动识别应前往 ChatGPT Plus、Gemini、外部兑换网站或人工处理流程。
                </p>
            </section>

            <section class="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <label class="block">
                    <span class="text-sm font-semibold text-slate-700">卡密</span>
                    <input
                        v-model="cardKey"
                        class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="请输入购买到的卡密"
                        autocomplete="off"
                        @keydown.enter.prevent="handleResolve"
                    />
                </label>

                <div v-if="errorMessage" class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {{ errorMessage }}
                </div>

                <button
                    type="button"
                    :disabled="loading"
                    class="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    @click="handleResolve"
                >
                    {{ loading ? '正在识别...' : '识别并前往兑换' }}
                </button>

                <div v-if="result" class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                    <div class="font-bold text-slate-900">识别结果</div>
                    <div class="mt-2">{{ result.message || '已完成识别' }}</div>
                    <div class="mt-3 grid gap-2 sm:grid-cols-2">
                        <div>供应商：<strong>{{ result.provider || '-' }}</strong></div>
                        <div>产品类型：<strong>{{ result.product_type || '-' }}</strong></div>
                        <div>兑换模式：<strong>{{ result.redeem_mode || '-' }}</strong></div>
                    </div>
                    <div v-if="result.target_path" class="mt-4">
                        <button class="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700" @click="goTarget">
                            前往兑换页
                        </button>
                    </div>
                    <div v-if="result.redeem_url" class="mt-4">
                        <a :href="result.redeem_url" target="_blank" rel="noopener noreferrer" class="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700">
                            打开外部兑换网站
                        </a>
                    </div>
                    <div v-if="result.redeem_mode === 'unknown'" class="mt-4 flex flex-wrap gap-3">
                        <router-link class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100" :to="`/redeem/chatgpt-plus?card_key=${encodeURIComponent(cardKey)}`">
                            尝试 ChatGPT Plus
                        </router-link>
                        <router-link class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100" :to="`/redeem/gemini?cdkey=${encodeURIComponent(cardKey)}`">
                            尝试 Gemini
                        </router-link>
                    </div>
                </div>
            </section>
        </div>
    </main>
</template>
