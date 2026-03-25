<script setup>
const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['edit', 'delete']);

const formatAmount = (row) =>
  `${row.type === 'income' ? '+' : '-'}${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(row.amount)}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
</script>

<template>
  <div class="content-card">
    <div class="section-head">
      <div>
        <h2 class="section-title">Transactions</h2>
        <p class="section-copy">
          {{ props.transactions.length }} record{{ props.transactions.length === 1 ? '' : 's' }}
          matched your current filters.
        </p>
      </div>
    </div>

    <div class="table-wrap">
      <el-table :data="props.transactions" v-loading="props.loading">
        <el-table-column label="Date" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>

        <el-table-column prop="category" label="Category" min-width="120" />

        <el-table-column label="Type" min-width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.type === 'income' ? 'success' : 'danger'"
              effect="dark"
              size="small"
              round
            >
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Amount" min-width="130">
          <template #default="{ row }">
            <span
              class="table-amount"
              :class="
                row.type === 'income'
                  ? 'table-amount--income'
                  : 'table-amount--expense'
              "
            >
              {{ formatAmount(row) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="note" label="Note" min-width="200" show-overflow-tooltip />

        <el-table-column label="Actions" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button 
                circle 
                size="small" 
                type="primary" 
                plain
                @click="emit('edit', row)"
                title="Edit transaction"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </el-button>
              <el-button 
                circle 
                size="small" 
                type="danger" 
                plain
                @click="emit('delete', row)"
                title="Delete transaction"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
