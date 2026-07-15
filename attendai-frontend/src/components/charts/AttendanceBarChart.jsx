import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function AttendanceBarChart({ labels, data, label = 'Sessions', color = '#0FB5BA' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: color,
        borderRadius: 4,
        maxBarThickness: 28,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0B1220',
        titleFont: { family: 'JetBrains Mono', size: 11 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8493A8' },
      },
      y: {
        grid: { color: '#E3E8F0' },
        ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8493A8' },
      },
    },
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}
