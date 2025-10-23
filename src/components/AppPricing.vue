<script setup>
import { useI18n } from 'vue-i18n'
import safeBoxWithGoldenCoin from "@images/misc/3d-safe-box-with-golden-dollar-coins.png"
import spaceRocket from "@images/misc/3d-space-rocket-with-smoke.png"
import dollarCoinPiggyBank from "@images/misc/dollar-coins-flying-pink-piggy-bank.png"

const props = defineProps({
  title: {
    type: String,
    required: false,
  },
  xs: {
    type: [Number, String],
    required: false,
  },
  sm: {
    type: [Number, String],
    required: false,
  },
  md: {
    type: [String, Number],
    required: false,
  },
  lg: {
    type: [String, Number],
    required: false,
  },
  xl: {
    type: [String, Number],
    required: false,
  },
})

const { t } = useI18n()

const annualMonthlyPlanPriceToggler = ref(true)

const pricingPlans = computed(() => [
  {
    name: t('components.appPricing.plans.basic.name'),
    tagLine: t('components.appPricing.plans.basic.tagLine'),
    logo: dollarCoinPiggyBank,
    monthlyPrice: 0,
    yearlyPrice: 0,
    isPopular: false,
    current: true,
    features: [
      t('components.appPricing.plans.basic.features.0'),
      t('components.appPricing.plans.basic.features.1'),
      t('components.appPricing.plans.basic.features.2'),
      t('components.appPricing.plans.basic.features.3'),
      t('components.appPricing.plans.basic.features.4'),
    ],
  },
  {
    name: t('components.appPricing.plans.standard.name'),
    tagLine: t('components.appPricing.plans.standard.tagLine'),
    logo: safeBoxWithGoldenCoin,
    monthlyPrice: 49,
    yearlyPrice: 499,
    isPopular: true,
    current: false,
    features: [
      t('components.appPricing.plans.standard.features.0'),
      t('components.appPricing.plans.standard.features.1'),
      t('components.appPricing.plans.standard.features.2'),
      t('components.appPricing.plans.standard.features.3'),
      t('components.appPricing.plans.standard.features.4'),
    ],
  },
  {
    name: t('components.appPricing.plans.enterprise.name'),
    tagLine: t('components.appPricing.plans.enterprise.tagLine'),
    logo: spaceRocket,
    monthlyPrice: 99,
    yearlyPrice: 999,
    isPopular: false,
    current: false,
    features: [
      t('components.appPricing.plans.enterprise.features.0'),
      t('components.appPricing.plans.enterprise.features.1'),
      t('components.appPricing.plans.enterprise.features.2'),
      t('components.appPricing.plans.enterprise.features.3'),
      t('components.appPricing.plans.enterprise.features.4'),
    ],
  },
])
</script>

<template>
  <!-- 👉 Title and subtitle -->
  <div class="text-center">
    <h3 class="text-h3 pricing-title mb-2">
      {{ props.title ? props.title : t('components.appPricing.title') }}
    </h3>
    <p class="mb-0">
      {{ t('components.appPricing.subtitle1') }}
    </p>
    <p class="mb-2">
      {{ t('components.appPricing.subtitle2') }}
    </p>
  </div>

  <!-- 👉 Annual and monthly price toggler -->

  <div class="d-flex font-weight-medium text-body-1 align-center justify-center mx-auto mt-12 mb-6">
    <VLabel
      for="pricing-plan-toggle"
      class="me-3"
    >
      {{ t('components.appPricing.monthly') }}
    </VLabel>

    <div class="position-relative">
      <VSwitch
        id="pricing-plan-toggle"
        v-model="annualMonthlyPlanPriceToggler"
      >
        <template #label>
          <div class="text-body-1 font-weight-medium">
            {{ t('components.appPricing.annually') }}
          </div>
        </template>
      </VSwitch>

      <div class="save-upto-chip position-absolute align-center d-none d-md-flex gap-1">
        <VIcon
          icon="tabler-corner-left-down"
          size="24"
          class="flip-in-rtl mt-2 text-disabled"
        />
        <VChip
          label
          color="primary"
          size="small"
        >
          {{ t('components.appPricing.saveUpTo') }}
        </VChip>
      </div>
    </div>
  </div>

  <!-- SECTION pricing plans -->
  <VRow>
    <VCol
      v-for="plan in pricingPlans"
      :key="plan.logo"
      v-bind="props"
      cols="12"
    >
      <!-- 👉  Card -->
      <VCard
        flat
        border
        :class="plan.isPopular ? 'border-primary border-opacity-100' : ''"
      >
        <VCardText
          style="block-size: 3.75rem"
          class="text-end"
        >
          <!-- 👉 Popular -->
          <VChip
            v-show="plan.isPopular"
            label
            color="primary"
            size="small"
          >
            {{ t('components.appPricing.popular') }}
          </VChip>
        </VCardText>

        <!-- 👉 Plan logo -->
        <VCardText>
          <VImg
            :height="120"
            :width="120"
            :src="plan.logo"
            class="mx-auto mb-5"
          />

          <!-- 👉 Plan name -->
          <h4 class="text-h4 mb-1 text-center">
            {{ plan.name }}
          </h4>
          <p class="mb-0 text-body-1 text-center">
            {{ plan.tagLine }}
          </p>

          <!-- 👉 Plan price  -->

          <div class="position-relative">
            <div class="d-flex justify-center pt-5 pb-10">
              <div class="text-body-1 align-self-start font-weight-medium">
                $
              </div>
              <h1 class="text-h1 font-weight-medium text-primary">
                {{
                  annualMonthlyPlanPriceToggler
                    ? Math.floor(Number(plan.yearlyPrice) / 12)
                    : plan.monthlyPrice
                }}
              </h1>
              <div class="text-body-1 font-weight-medium align-self-end">
                {{ t('components.appPricing.perMonth') }}
              </div>
            </div>

            <!-- 👉 Annual Price -->
            <span
              v-show="annualMonthlyPlanPriceToggler"
              class="annual-price-text position-absolute text-caption text-disabled pb-4"
            >
              {{ plan.yearlyPrice === 0 ? t('components.appPricing.free') : t('components.appPricing.yearlyPrice', { price: plan.yearlyPrice }) }}
            </span>
          </div>

          <!-- 👉 Plan features -->

          <VList class="card-list mb-4">
            <VListItem
              v-for="feature in plan.features"
              :key="feature"
            >
              <template #prepend>
                <VIcon
                  size="8"
                  icon="tabler-circle-filled"
                  color="rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity))"
                />
              </template>

              <VListItemTitle class="text-body-1">
                {{ feature }}
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Plan actions -->
          <VBtn
            block
            :color="plan.current ? 'success' : 'primary'"
            :variant="plan.isPopular ? 'elevated' : 'tonal'"
            :to="{ name: 'front-pages-payment' }"
            :active="false"
          >
            {{ plan.yearlyPrice === 0 ? t('components.appPricing.currentPlan') : t('components.appPricing.upgrade') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <!-- !SECTION  -->
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1rem;
}

.save-upto-chip {
  inset-block-start: -2.4rem;
  inset-inline-end: -6rem;
}

.annual-price-text {
  inset-block-end: 3%;
  inset-inline-start: 50%;
  transform: translateX(-50%);
}
</style>
