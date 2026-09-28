<template>
  <section class="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/30 sm:p-5">
    <h3 class="flex items-center gap-2 text-lg font-bold theme-text-primary">
      <span class="text-emerald-600 dark:text-emerald-400" aria-hidden="true">✓</span>
      {{ t('orderDetail.cardDelivery.title') }}
    </h3>
    <p class="mt-2 text-sm theme-text-secondary">{{ t('orderDetail.cardDelivery.description') }}</p>
    <div class="mt-4 rounded-xl border border-blue-200 bg-white p-4 dark:border-blue-900 dark:bg-gray-950">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-semibold theme-text-primary">{{ t('orderDetail.cardDelivery.label') }}</span>
        <button v-if="!truncated" type="button" @click="copy" :disabled="copying"
          class="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          aria-live="polite">
          {{ t(copied ? 'orderDetail.cardDelivery.copied' : 'orderDetail.cardDelivery.copy') }}
        </button>
        <button v-else type="button" :disabled="downloading" @click="$emit('download')"
          class="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {{ t(downloading ? 'orderDetail.fulfillmentDownloading' : 'orderDetail.cardDelivery.download') }}
        </button>
      </div>
      <p v-if="truncated" class="mt-3 text-sm theme-text-muted">
        {{ t('orderDetail.fulfillmentTotalLines', { count: lineCount }) }} · {{ t('orderDetail.fulfillmentTruncatedHint') }}
      </p>
      <pre class="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap break-all font-mono text-base leading-relaxed theme-text-primary select-text">{{ payload }}</pre>
      <p v-if="copyFailed" role="alert" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ t('orderDetail.cardDelivery.copyFailed') }}</p>
    </div>
    <div class="mt-4 text-sm theme-text-secondary">
      <p class="font-semibold theme-text-primary">{{ t('orderDetail.cardDelivery.next') }}</p>
      <p class="mt-1 leading-relaxed">{{ t('orderDetail.cardDelivery.guide') }}</p>
      <p class="mt-1 leading-relaxed lg:hidden">{{ t('orderDetail.cardDelivery.mobileGuide') }}</p>
    </div>
    <p class="mt-3 text-xs theme-text-muted">{{ t('orderDetail.cardDelivery.privacy') }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { copyText } from '../utils/clipboard'

const props = defineProps<{ payload: string; lineCount?: number; downloading?: boolean }>()
defineEmits<{ download: [] }>()
const { t } = useI18n()
const truncated = computed(() => (props.lineCount || 0) > 100)
const copied = ref(false)
const copying = ref(false)
const copyFailed = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
const copy = async () => {
  copying.value = true
  copyFailed.value = false
  try {
    await copyText(props.payload)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 2000)
  } catch {
    copied.value = false
    copyFailed.value = true
  } finally {
    copying.value = false
  }
}
onUnmounted(() => clearTimeout(timer))
</script>
