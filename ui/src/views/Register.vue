<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

import { registerUser, sendOtp } from '../services/authService';
import { setAuth } from '../store/auth';

const props = defineProps(['theme']);
const emit = defineEmits(['toggle-theme']);

const router = useRouter();
const loading = ref(false);
const formRef = ref(null);
const step = ref('form'); // 'form' or 'verify'

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  otp: '',
});

const devOtp = ref('');
const otpLoading = ref(false);
const otpCountdown = ref(0);
let timer = null;

const startTimer = () => {
  otpCountdown.value = 60;
  timer = setInterval(() => {
    if (otpCountdown.value > 0) {
      otpCountdown.value -= 1;
    } else {
      clearInterval(timer);
    }
  }, 1000);
};

const handleSendOtp = async () => {
  await formRef.value.validate();
  otpLoading.value = true;
  try {
    const { data } = await sendOtp(form.email);
    ElMessage.success(data.message || 'Verification code sent to your email.');
    
    // Extract OTP if in dev mode message
    if (data.message && data.message.includes('Dev:')) {
      const match = data.message.match(/Dev: (\d+)/);
      if (match) devOtp.value = match[1];
    }
    
    step.value = 'verify';
    startTimer();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || 'Failed to send OTP.');
  } finally {
    otpLoading.value = false;
  }
};

const otpInputs = ref(['', '', '', '', '', '']);
const inputRefs = ref([]);

const handleOtpInput = (index, event) => {
  const val = event.target.value;
  if (!/^\d*$/.test(val)) {
    otpInputs.value[index] = '';
    return;
  }

  if (val && index < 5) {
    inputRefs.value[index + 1].focus();
  }
  
  form.otp = otpInputs.value.join('');
};

const handleKeyDown = (index, event) => {
  if (event.key === 'Backspace' && !otpInputs.value[index] && index > 0) {
    inputRefs.value[index - 1].focus();
  }
};

const handlePaste = (event) => {
  const pasteData = event.clipboardData.getData('text').slice(0, 6);
  if (/^\d+$/.test(pasteData)) {
    pasteData.split('').forEach((char, i) => {
      otpInputs.value[i] = char;
    });
    form.otp = otpInputs.value.join('');
    if (pasteData.length === 6) {
      inputRefs.value[5].focus();
    }
  }
};

const handleBack = () => {
  step.value = 'form';
  devOtp.value = '';
  clearInterval(timer);
  otpCountdown.value = 0;
};

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Please confirm your password.'));
    return;
  }

  if (value !== form.password) {
    callback(new Error('Passwords do not match.'));
    return;
  }

  callback();
};

const rules = {
  name: [{ required: true, message: 'Please enter your name.', trigger: 'blur' }],
  email: [
    { required: true, message: 'Please enter your email.', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email.', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please create a password.', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters.', trigger: 'blur' },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
};

const handleRegister = async () => {
  loading.value = true;

  try {
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      otp: form.otp,
    };

    const { data } = await registerUser(payload);
    setAuth(data);
    ElMessage.success('Account created successfully.');
    router.push({ name: 'Dashboard' });
  } catch (error) {
    ElMessage.error(error.response?.data?.message || 'Unable to create account.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-layout-wrap">
    <header class="auth-header">
      <div class="navbar__brand">
        <span>💰 FlowTrack</span>
      </div>
      <button class="theme-toggle" @click="emit('toggle-theme')">
        <svg v-if="props.theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </header>

    <div class="auth-layout">
      <!-- HERO (Hidden on Verify Step to focus on code) -->
      <section v-if="step === 'form'" class="auth-hero">
        <div>
          <p class="eyebrow">FlowTrack</p>
          <h1>Build a cleaner money routine.</h1>
          <p>
            Create your account to start tracking income and expenses with visual
            breakdowns and exportable records.
          </p>
        </div>

        <div class="auth-points">
          <div class="auth-point">
            <span class="auth-point-icon">⚡</span>
            Quick transaction capture with edit and delete.
          </div>
          <div class="auth-point">
            <span class="auth-point-icon">🔍</span>
            Smart filters to narrow the list by type.
          </div>
          <div class="auth-point">
            <span class="auth-point-icon">📱</span>
            Polished dashboard for desktop and mobile.
          </div>
        </div>
      </section>

      <!-- STEP 1: REGISTRATION FORM -->
      <div v-if="step === 'form'" class="auth-card">
        <h2>Create account</h2>
        <p>Set up your login and jump straight into the dashboard.</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="Full Name" prop="name">
            <el-input v-model="form.name" placeholder="Your full name" size="large" />
          </el-form-item>

          <el-form-item label="Email" prop="email">
            <el-input v-model="form.email" placeholder="you@example.com" size="large" />
          </el-form-item>

          <el-form-item label="Password" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="At least 6 characters"
              size="large"
            />
          </el-form-item>

          <el-form-item label="Confirm Password" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              show-password
              placeholder="Repeat your password"
              size="large"
            />
          </el-form-item>

          <el-button
            type="primary"
            :loading="otpLoading"
            size="large"
            style="width: 100%; margin-top: 16px;"
            @click="handleSendOtp"
          >
            Create Account
          </el-button>
        </el-form>

        <div class="auth-footer">
          Already have an account?
          <RouterLink to="/login">Sign in</RouterLink>
        </div>
      </div>

      <!-- STEP 2: VERIFICATION PAGE -->
      <div v-else class="auth-card verify-card">
        <button class="back-link" @click="handleBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>
        
        <div class="verify-header">
          <h2>Verify</h2>
          <p>We have sent a code to <span class="email-highlight">{{ form.email }}</span></p>
          <div v-if="devOtp" class="dev-otp-notice">
            <span class="icon">💻</span>
            <span>Dev Mode: Your OTP is <strong>{{ devOtp }}</strong></span>
          </div>
        </div>

        <div class="otp-container">
          <label>Verification code</label>
          <div class="otp-inputs">
            <input
              v-for="(digit, index) in 6"
              :key="index"
              ref="inputRefs"
              v-model="otpInputs[index]"
              type="text"
              maxlength="1"
              class="otp-input-field"
              @input="handleOtpInput(index, $event)"
              @keydown="handleKeyDown(index, $event)"
              @paste="handlePaste"
            />
          </div>
        </div>

        <el-button
          type="primary"
          :loading="loading"
          :disabled="form.otp.length < 6"
          size="large"
          class="verify-btn"
          @click="handleRegister"
        >
          Verify
        </el-button>

        <div class="resend-timer">
          <span v-if="otpCountdown > 0">
            Request for new code in <strong>00:{{ otpCountdown.toString().padStart(2, '0') }}</strong> seconds
          </span>
          <button v-else class="resend-link" @click="handleSendOtp">Resend code</button>
        </div>

        <div class="email-links">
          <a href="https://mail.google.com" target="_blank" class="email-btn">
            <img src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png" alt="Gmail" width="18">
            Open Gmail
          </a>
          <a href="https://outlook.live.com" target="_blank" class="email-btn">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook" width="18">
            Open Outlook
          </a>
        </div>

        <div class="verify-footer">
          <p>Didn't get the code?</p>
          <ul>
            <li>Please check your spam folder.</li>
            <li>Codes can take up to 5 minutes to arrive.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
