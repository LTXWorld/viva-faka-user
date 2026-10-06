<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { usePageSeo } from '../composables/usePageSeo'
import { getCardRedeemRules, matchCardRedeemRule } from '../utils/cardRedeem'

const { t } = useI18n()
const appStore = useAppStore()
const code = ref('')
const refreshing = ref(true)
const refreshFailed = ref(false)
const rules = computed(() => getCardRedeemRules(appStore.config?.card_redeem_rules))
const matchedRule = computed(() => matchCardRedeemRule(code.value, rules.value))

usePageSeo({ title: () => t('nav.cardRedeem'), canonicalPath: () => '/redeem' })

// Fetch current settings on each visit so an administrator's URL changes are picked up.
const refreshConfig = async () => {
  refreshing.value = true
  refreshFailed.value = !(await appStore.loadConfig(true))
  refreshing.value = false
}
onMounted(refreshConfig)
</script>

<template>
  <div class="min-h-screen theme-page pt-28 pb-16">
    <div class="container mx-auto max-w-3xl px-4 space-y-6">
      <header>
        <h1 class="text-3xl font-black theme-text-primary">{{ t('nav.cardRedeem') }}</h1>
        <p class="mt-3 theme-text-secondary">{{ t('cardRedeem.subtitle') }}</p>
      </header>

      <div v-if="refreshing" role="status" class="theme-panel border rounded-2xl p-6 theme-text-muted">
        {{ t('common.loading') }}
      </div>
      <div v-else-if="refreshFailed" role="alert" class="theme-panel border rounded-2xl p-6 space-y-4">
        <p class="theme-text-muted">{{ t('cardRedeem.loadFailed') }}</p>
        <button type="button" class="theme-btn-primary rounded-xl px-5 py-3" @click="refreshConfig">{{ t('emptyState.retry') }}</button>
      </div>
      <template v-else>
        <section v-if="rules.length" class="theme-panel border rounded-2xl p-6 space-y-4">
          <label for="redeem-code" class="block font-semibold theme-text-primary">{{ t('cardRedeem.codeLabel') }}</label>
          <input id="redeem-code" v-model="code" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
            :placeholder="t('cardRedeem.codePlaceholder')"
            class="w-full rounded-xl border theme-border theme-surface-soft theme-text-primary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p class="text-xs theme-text-muted">{{ t('cardRedeem.privacyTip') }}</p>
          <div aria-live="polite" class="space-y-3">
            <template v-if="code.trim() && matchedRule">
              <p class="theme-text-secondary">{{ t('cardRedeem.prefixLabel', { prefix: matchedRule.prefix }) }}</p>
              <a :href="matchedRule.url" target="_blank" rel="noopener noreferrer"
                class="theme-btn-primary inline-flex rounded-xl px-5 py-3 font-semibold">{{ t('cardRedeem.openWebsite') }}</a>
              <p class="text-sm break-all theme-text-muted">{{ matchedRule.url }}</p>
            </template>
            <p v-else-if="code.trim()" class="theme-text-muted">{{ t('cardRedeem.noMatch') }}</p>
          </div>
        </section>

        <section v-if="rules.length" class="space-y-3">
          <h2 class="text-lg font-bold theme-text-primary">{{ t('cardRedeem.rulesTitle') }}</h2>
          <article v-for="rule in rules" :key="rule.prefix" class="theme-panel border rounded-2xl p-5 space-y-3">
            <p class="font-semibold theme-text-primary">{{ t('cardRedeem.prefixLabel', { prefix: rule.prefix }) }}</p>
            <a :href="rule.url" target="_blank" rel="noopener noreferrer" class="inline-block break-all theme-text-accent underline underline-offset-4">
              {{ rule.url }}
            </a>
          </article>
        </section>

        <p v-if="!rules.length" class="theme-panel border rounded-2xl p-6 theme-text-muted">{{ t('cardRedeem.empty') }}</p>
      </template>
    </div>
  </div>
</template>
