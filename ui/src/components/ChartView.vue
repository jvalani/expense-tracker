<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ArcElement, Chart, Legend, Tooltip, DoughnutController, registerables } from 'chart.js';
Chart.register(...registerables);

const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
  selectedMonth: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    default: 'light',
  },
});

const canvasRef = ref(null);
let chartInstance = null;

// Finance-specific palettes
const lightPalette = [
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#10B981', // emerald
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#0EA5E9', // sky
];

const darkPalette = [
  '#60A5FA', 
  '#FBBF24', 
  '#34D399', 
  '#C084FC', 
  '#F472B6',
  '#38BDF8',
];

const palette = computed(() => props.theme === 'dark' ? darkPalette : lightPalette);

const monthLabel = computed(() => {
  if (!props.selectedMonth) {
    return 'this month';
  }

  const [year, month] = props.selectedMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);

  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
});

const chartData = computed(() => {
  if (!props.selectedMonth) {
    return { labels: [], values: [] };
  }

  const [year, month] = props.selectedMonth.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const totals = {};

  props.transactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transaction.type === 'expense' &&
        transactionDate >= start &&
        transactionDate < end
      );
    })
    .forEach((transaction) => {
      totals[transaction.category] =
        (totals[transaction.category] || 0) + Number(transaction.amount);
    });

  return {
    labels: Object.keys(totals),
    values: Object.values(totals),
  };
});

const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (!canvasRef.value || chartData.value.labels.length === 0) {
    return;
  }

  chartInstance = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels: chartData.value.labels,
      datasets: [
        {
          data: chartData.value.values,
          backgroundColor: chartData.value.labels.map(
            (_, index) => palette.value[index % palette.value.length] + 'cc'
          ),
          borderColor: chartData.value.labels.map(
            (_, index) => palette.value[index % palette.value.length]
          ),
          borderWidth: 2,
          hoverOffset: 12,
          hoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: props.theme === 'dark' ? '#CBD5E1' : '#6B7280',
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
            font: {
              family: "'Inter', sans-serif",
              size: 13,
            },
          },
        },
        tooltip: {
          backgroundColor: props.theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: props.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          titleColor: props.theme === 'dark' ? '#F8FAF9' : '#111827',
          bodyColor: props.theme === 'dark' ? '#CBD5E1' : '#6B7280',
          padding: 12,
          cornerRadius: 12,
        },
      },
    },
  });
};

watch(chartData, renderChart, { deep: true });
watch(() => props.selectedMonth, renderChart);
watch(() => props.theme, renderChart);

onMounted(renderChart);
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<template>
  <div class="chart-card">
    <div class="section-head">
      <div>
        <h2 class="section-title">Expense breakdown</h2>
        <p class="section-copy">
          Category-wise split for {{ monthLabel }}.
        </p>
      </div>
    </div>

    <div v-if="chartData.labels.length" style="height: 300px; position: relative;">
      <canvas ref="canvasRef"></canvas>
    </div>

    <div v-else class="chart-state">
      <div>
        <div style="font-size: 2.5rem; margin-bottom: 12px;">📊</div>
        <h3 style="margin: 0 0 8px;">No data for {{ monthLabel }}</h3>
        <p style="margin: 0; font-size: 0.9rem;">Add expense transactions to see the breakdown.</p>
      </div>
    </div>
  </div>
</template>
