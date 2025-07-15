// PieChartWithLegend.jsx
// استخدم chart.js أو أي كود جاهز من shadcn
import { Pie } from 'react-chartjs-2';
import { Card } from './card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChartWithLegend({ data, labels, title }) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          '#4ade80', // شقق فاضية
          '#facc15', // مستأجرين
          '#60a5fa', // طلاب
          '#f87171', // مشفى
          '#a78bfa', // زبائن
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card className="p-4">
      <h3 className="font-bold mb-2">{title || 'Statistics'}</h3>
      <Pie data={chartData} />
      <div className="mt-4 flex flex-wrap gap-2">
        {labels.map((label, i) => (
          <span key={label} className="flex items-center gap-2">
            <span style={{ width: 16, height: 16, background: chartData.datasets[0].backgroundColor[i], display: 'inline-block', borderRadius: '50%' }} />
            <span>{label}: {data[i]}</span>
          </span>
        ))}
      </div>
    </Card>
  );
}
