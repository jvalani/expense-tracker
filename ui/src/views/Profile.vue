<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuth, setAuth } from '../store/auth';
import { updateProfile } from '../services/authService';

const props = defineProps(['theme']);
const emit = defineEmits(['toggle-theme']);

const { user } = useAuth();
const loading = ref(false);
const formRef = ref(null);

const form = reactive({
  name: user.value?.name || '',
  email: user.value?.email || '',
  password: '',
  confirmPassword: '',
});

const validateConfirmPassword = (rule, value, callback) => {
  if (form.password && !value) {
    callback(new Error('Please confirm your new password.'));
    return;
  }
  if (value && value !== form.password) {
    callback(new Error('Passwords do not match.'));
    return;
  }
  callback();
};

const rules = {
  name: [{ required: true, message: 'Please enter your name.', trigger: 'blur' }],
  password: [{ min: 6, message: 'Password must be at least 6 characters.', trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
};

const handleUpdateProfile = async () => {
  await formRef.value.validate();
  loading.value = true;

  try {
    const payload = {
      name: form.name,
    };

    if (form.password) {
      payload.password = form.password;
    }

    const { data } = await updateProfile(payload);
    
    // Update local store with new user data
    setAuth({ 
      token: localStorage.getItem('token'), // Keep existing token
      user: data.user 
    });
    
    ElMessage.success('Profile updated successfully.');
    form.password = '';
    form.confirmPassword = '';
  } catch (error) {
    ElMessage.error(error.response?.data?.message || 'Failed to update profile.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="dashboard-layout">
    <div class="dashboard-main">
      <div class="section-head">
        <div>
          <h1 class="section-title">My Profile</h1>
          <p class="section-copy">Manage your account information and security.</p>
        </div>
      </div>

      <div class="profile-card glass-card">
        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          label-position="top"
          class="profile-form"
        >
          <div class="form-grid">
            <el-form-item label="Full Name" prop="name">
              <el-input v-model="form.name" size="large" />
            </el-form-item>

            <el-form-item label="Email Address">
              <el-input v-model="form.email" disabled size="large" />
              <p class="input-hint">Email cannot be changed.</p>
            </el-form-item>

            <el-form-item label="New Password (optional)" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                show-password
                placeholder="Leave blank to keep current"
                size="large"
              />
            </el-form-item>

            <el-form-item label="Confirm New Password" prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                show-password
                placeholder="Repeat new password"
                size="large"
              />
            </el-form-item>
          </div>

          <div class="form-footer">
            <el-button 
              type="primary" 
              :loading="loading" 
              size="large"
              @click="handleUpdateProfile"
            >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              </template>
              Save Changes
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  max-width: 800px;
  padding: 40px;
  margin-top: 24px;
}

.profile-form {
  max-width: 600px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 30px;
}

.input-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.form-footer {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
