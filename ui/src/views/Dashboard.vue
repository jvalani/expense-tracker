<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import ChartView from '../components/ChartView.vue';
import Navbar from '../components/Navbar.vue';
import TransactionForm from '../components/TransactionForm.vue';
import TransactionList from '../components/TransactionList.vue';
import {
  allCategories,
  expenseCategories,
  incomeCategories,
} from '../services/categoryOptions';
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from '../services/transactionService';
import { authState } from '../store/auth';

const props = defineProps(['theme']);
const emit = defineEmits(['toggle-theme']);

const loading = ref(false);
const formLoading = ref(false);
const transactions = ref([]);
const editingTransaction = ref(null);
const formResetKey = ref(0);

const getCurrentMonthValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
};

const selectedMonth = ref(getCurrentMonthValue());

const filters = ref({
  type: 'all',
  category: 'all',
});

const formatAmount = (value) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const loadTransactions = async () => {
  loading.value = true;

  try {
    const { data } = await fetchTransactions();
    transactions.value = data;
  } catch (error) {
    ElMessage.error(error.response?.data?.message || 'Failed to load transactions.');
  } finally {
    loading.value = false;
  }
};

const filterCategoryOptions = computed(() => {
  if (filters.value.type === 'income') {
    return incomeCategories;
  }

  if (filters.value.type === 'expense') {
    return expenseCategories;
  }

  return allCategories;
});

watch(
  () => filters.value.type,
  () => {
    if (
      filters.value.category !== 'all' &&
      !filterCategoryOptions.value.includes(filters.value.category)
    ) {
      filters.value.category = 'all';
    }
  }
);

const filteredTransactions = computed(() =>
  transactions.value.filter((transaction) => {
    const typeMatch =
      filters.value.type === 'all' || transaction.type === filters.value.type;
    const categoryMatch =
      filters.value.category === 'all' ||
      transaction.category === filters.value.category;

    return typeMatch && categoryMatch;
  })
);

const totalIncome = computed(() =>
  transactions.value
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
);

const totalExpense = computed(() =>
  transactions.value
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
);

const netBalance = computed(() => totalIncome.value - totalExpense.value);

const handleSubmit = async (payload) => {
  formLoading.value = true;

  try {
    if (editingTransaction.value?._id) {
      await updateTransaction(editingTransaction.value._id, payload);
      ElMessage.success('Transaction updated.');
    } else {
      await createTransaction(payload);
      ElMessage.success('Transaction added.');
    }

    editingTransaction.value = null;
    formResetKey.value += 1;
    await loadTransactions();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || 'Unable to save transaction.');
  } finally {
    formLoading.value = false;
  }
};

const handleEdit = (transaction) => {
  editingTransaction.value = { ...transaction };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleCancelEdit = () => {
  editingTransaction.value = null;
};

const handleDelete = async (transaction) => {
  try {
    await ElMessageBox.confirm(
      `Delete the ${transaction.category} transaction for ${formatAmount(
        transaction.amount
      )}?`,
      'Delete Transaction',
      {
        type: 'warning',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
      }
    );

    await deleteTransaction(transaction._id);

    if (editingTransaction.value?._id === transaction._id) {
      editingTransaction.value = null;
    }

    ElMessage.success('Transaction deleted.');
    await loadTransactions();
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return;
    }

    ElMessage.error(error.response?.data?.message || 'Unable to delete transaction.');
  }
};

const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const exportCsv = () => {
  if (!filteredTransactions.value.length) {
    ElMessage.warning('There are no filtered transactions to export.');
    return;
  }

  const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
  const rows = filteredTransactions.value.map((transaction) => [
    new Date(transaction.date).toISOString().split('T')[0],
    transaction.type,
    transaction.category,
    Number(transaction.amount).toFixed(2),
    transaction.note || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

onMounted(loadTransactions);
</script>

<template>
  <div class="page-shell">
    <Navbar 
      :user-name="authState.user?.name" 
      :theme="props.theme"
      @toggle-theme="emit('toggle-theme')"
    />

    <section class="hero-panel">
      <div>
        <p class="eyebrow">Your finance overview</p>
        <h1>Track every inflow and outflow without losing the bigger picture.</h1>
        <p>
          Review your balance, filter the transaction stream, and inspect monthly
          expense categories in one place.
        </p>
      </div>

      <el-button size="large" @click="exportCsv"
        style="background: linear-gradient(135deg, #0ea5e9, #38bdf8); border: none; color: #fff; font-weight: 600; box-shadow: 0 4px 14px rgba(14,165,233,0.35);">
        ↓ Export CSV
      </el-button>
    </section>

    <section class="stats-grid">
      <div class="metric-card metric-card--income">
        <p class="metric-card__label">💚 Total Income</p>
        <h2 class="metric-card__value">{{ formatAmount(totalIncome) }}</h2>
      </div>

      <div class="metric-card metric-card--expense">
        <p class="metric-card__label">❤️ Total Expense</p>
        <h2 class="metric-card__value">{{ formatAmount(totalExpense) }}</h2>
      </div>

      <div class="metric-card metric-card--balance">
        <p class="metric-card__label">💜 Net Balance</p>
        <h2 class="metric-card__value">{{ formatAmount(netBalance) }}</h2>
      </div>
    </section>

    <div class="dashboard-grid">
      <div class="dashboard-main">
        <TransactionForm
          :key="formResetKey"
          :transaction="editingTransaction"
          :loading="formLoading"
          @submit="handleSubmit"
          @cancel="handleCancelEdit"
        />

        <div class="content-card">
          <div class="section-head">
            <div>
              <h2 class="section-title">Filter transactions</h2>
              <p class="section-copy">
                Narrow the list by transaction type or category.
              </p>
            </div>
          </div>

          <el-form label-position="top">
            <div class="filters-grid">
              <el-form-item label="Type">
                <el-select v-model="filters.type" style="width: 100%;">
                  <el-option label="All types" value="all" />
                  <el-option label="Income" value="income" />
                  <el-option label="Expense" value="expense" />
                </el-select>
              </el-form-item>

              <el-form-item label="Category">
                <el-select v-model="filters.category" style="width: 100%;">
                  <el-option label="All categories" value="all" />
                  <el-option
                    v-for="option in filterCategoryOptions"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form>
        </div>

        <TransactionList
          :transactions="filteredTransactions"
          :loading="loading"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <div class="dashboard-side">
        <div class="month-card">
          <div class="section-head">
            <div>
              <h2 class="section-title">Chart month</h2>
              <p class="section-copy">
                Pick a month to update the breakdown.
              </p>
            </div>
          </div>

          <el-date-picker
            v-model="selectedMonth"
            type="month"
            value-format="YYYY-MM"
            placeholder="Select month"
            style="width: 100%"
          />
        </div>

        <ChartView :transactions="transactions" :selected-month="selectedMonth" />
      </div>
    </div>
  </div>
</template>
