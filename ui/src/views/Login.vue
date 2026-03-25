<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { applyPureReactInVue } from 'veaury';

// Import the React component
import { LoginPage } from '../components/ui/animated-characters-login-page';
import { loginUser } from '../services/authService';
import { setAuth } from '../store/auth';

const props = defineProps(['theme']);
const emit = defineEmits(['toggle-theme']);

const router = useRouter();
const loading = ref(false);
const error = ref('');

// Wrap React component for Vue
const ReactLogin = applyPureReactInVue(LoginPage);

const handleLogin = async (credentials) => {
  loading.value = true;
  error.value = '';

  try {
    const { data } = await loginUser(credentials);
    setAuth(data);
    ElMessage.success('Logged in successfully.');
    router.push({ name: 'Dashboard' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to log in.';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <ReactLogin 
    :onLogin="handleLogin" 
    :loading="loading" 
    :externalError="error"
    :theme="props.theme"
    @toggle-theme="emit('toggle-theme')"
  />
</template>

<style scoped>
/* Scoped styles removed as this is now handled by Tailwind in the React component */
</style>
