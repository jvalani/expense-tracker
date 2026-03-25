<script setup>
import { useRouter } from 'vue-router';
import { useAuth, clearAuth } from '../store/auth';

const props = defineProps({
  userName: { type: String, default: '' },
  theme: { type: String, default: 'light' },
});

const emit = defineEmits(['toggle-theme']);

const router = useRouter();
const { user } = useAuth();

const handleLogout = () => {
  clearAuth();
  router.push({ name: 'Login' });
};

const goToProfile = () => {
  router.push({ name: 'Profile' });
};
</script>

<template>
  <header class="navbar">
    <div class="navbar__brand">
      <span>💰 FlowTrack</span>
      <small>Personal finance dashboard</small>
    </div>

    <div class="navbar__actions">
      <div class="navbar__user" @click="goToProfile" style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <span class="navbar__user-dot"></span>
        <span style="font-weight: 600; font-size: 0.95rem;">
          {{ user?.name || 'User' }}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>

      <div style="width: 1px; height: 24px; background: var(--border); margin: 0 4px;"></div>

      <!-- Theme Toggle -->
      <button class="theme-toggle" @click="emit('toggle-theme')" :title="theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
        <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>

      <el-button
        size="small"
        round
        @click="handleLogout"
        style="border-color: var(--expense); color: var(--expense); background: var(--expense-bg);"
      >
        Sign out
      </el-button>
    </div>
  </header>
</template>
