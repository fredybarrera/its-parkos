<!--
  MetricCard — tarjeta de métrica genérica. PRESENTACIONAL: solo pinta
  label/value/hint. No sabe de dónde viene el dato.
-->
<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint?: string
}>()
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5">
    <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ label }}</p>
    <p class="mt-2 text-2xl font-bold text-slate-800">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>
