<script setup>
import { computed, reactive, ref, watch } from 'vue';

import {
  expenseCategories,
  incomeCategories,
} from '../services/categoryOptions';

const props = defineProps({
  transaction: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit', 'cancel']);
const formRef = ref(null);

const createEmptyForm = () => ({
  amount: null,
  type: 'expense',
  category: expenseCategories[0],
  date: new Date(),
  note: '',
});

const form = reactive(createEmptyForm());

const applyFormValues = (transaction) => {
  const nextValues = transaction
    ? {
        amount: Number(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        date: new Date(transaction.date),
        note: transaction.note || '',
      }
    : createEmptyForm();

  form.amount = nextValues.amount;
  form.type = nextValues.type;
  form.category = nextValues.category;
  form.date = nextValues.date;
  form.note = nextValues.note;
};

watch(
  () => props.transaction,
  (transaction) => {
    applyFormValues(transaction);
  },
  { immediate: true }
);

const categoryOptions = computed(() =>
  form.type === 'income' ? incomeCategories : expenseCategories
);

watch(
  () => form.type,
  (type) => {
    const options = type === 'income' ? incomeCategories : expenseCategories;

    if (!options.includes(form.category)) {
      form.category = options[0];
    }
  },
  { immediate: true }
);

const rules = {
  amount: [
    {
      required: true,
      message: 'Please enter an amount.',
      trigger: 'change',
    },
  ],
  type: [
    {
      required: true,
      message: 'Please select a transaction type.',
      trigger: 'change',
    },
  ],
  category: [
    {
      required: true,
      message: 'Please select a category.',
      trigger: 'change',
    },
  ],
  date: [
    {
      required: true,
      message: 'Please choose a date.',
      trigger: 'change',
    },
  ],
};

const resetForm = () => {
  applyFormValues(null);
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  await formRef.value.validate();

  emit('submit', {
    amount: Number(form.amount),
    type: form.type,
    category: form.category,
    date:
      form.date instanceof Date
        ? form.date.toISOString()
        : new Date(form.date).toISOString(),
    note: form.note.trim(),
  });
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};
</script>

<template>
  <div class="content-card">
    <div class="section-head">
      <div>
        <h2 class="section-title">
          {{ props.transaction ? 'Edit transaction' : 'Add a transaction' }}
        </h2>
        <p class="section-copy">
          Capture your money movement with a clear type, category, and note.
        </p>
      </div>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <div class="form-grid">
        <el-form-item label="Amount" prop="amount">
          <el-input-number
            v-model="form.amount"
            :min="0"
            :step="50"
            :precision="2"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Type" prop="type">
          <el-select v-model="form.type" placeholder="Select type">
            <el-option label="Income" value="income" />
            <el-option label="Expense" value="expense" />
          </el-select>
        </el-form-item>

        <el-form-item label="Category" prop="category">
          <el-select v-model="form.category" placeholder="Select category">
            <el-option
              v-for="option in categoryOptions"
              :key="option"
              :label="option"
              :value="option"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Date" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="Pick a date"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item class="full-width" label="Note">
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="3"
            placeholder="Add a quick note about this transaction"
          />
        </el-form-item>
      </div>

      <div class="toolbar">
        <p>
          {{
            props.transaction
              ? 'You are updating an existing entry.'
              : 'New entries appear immediately in the list and chart.'
          }}
        </p>

        <div class="toolbar-actions">
          <el-button v-if="props.transaction" @click="handleCancel">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </template>
            Cancel
          </el-button>
          <el-button type="primary" :loading="props.loading" @click="handleSubmit">
            <template #icon>
              <svg v-if="props.transaction" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </template>
            {{ props.transaction ? 'Update Transaction' : 'Add Transaction' }}
          </el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>
