import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function AttendancePieChart({ labels, data, colors }) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors || ['#1FA971', '#D98C2B', '#D14343', '#B23B6B'],
        borderWidth: 3,
        borderColor: '#FFFFFF',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 12 },
          color: '#4B5A72',
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#0B1220',
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 6,
      },
    },
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}
