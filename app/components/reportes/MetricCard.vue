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
  <div class="rounded-xl border border-asphalt-200 bg-white p-5">
    <p class="text-xs font-medium uppercase tracking-wide text-asphalt-500">{{ label }}</p>
    <p class="mt-2 font-mono text-2xl font-bold text-asphalt-800">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-asphalt-400">{{ hint }}</p>
  </div>
</template>
