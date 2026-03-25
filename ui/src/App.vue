<script setup>
import { onMounted, ref } from 'vue';

const theme = ref(localStorage.getItem('ft-theme') || 'light');

const applyTheme = (t) => {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('ft-theme', t);
};

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  applyTheme(theme.value);
};

onMounted(() => {
  applyTheme(theme.value);
});
</script>

<template>
  <div class="app-shell">
    <router-view :theme="theme" @toggle-theme="toggleTheme" />
  </div>
</template>
