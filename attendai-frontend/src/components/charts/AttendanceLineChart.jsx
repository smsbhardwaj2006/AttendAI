import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function AttendanceLineChart({ labels, data, label = 'Attendance %' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: '#0FB5BA',
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart
          if (!chartArea) return 'rgba(15,181,186,0.1)'
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(15,181,186,0.25)')
          gradient.addColorStop(1, 'rgba(15,181,186,0)')
          return gradient
        },
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#0FB5BA',
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        borderWidth: 2,
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
        min: 0,
        max: 100,
        grid: { color: '#E3E8F0' },
        ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8493A8', callback: (v) => `${v}%` },
      },
    },
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  )
}
