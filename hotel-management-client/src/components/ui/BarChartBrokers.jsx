// BarChartBrokers.jsx
// استخدم chart.js أو كود جاهز من shadcn
import { Bar } from "react-chartjs-2";
import { Card } from "./card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChartBrokers({
  labels,
  data,
  title,
  noDataMessage = "No data to display",
}) {
  const hasData = Array.isArray(data) && data.some((v) => v > 0);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Number of customers",
        data,
        backgroundColor: "#60a5fa",
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title },
    },
    scales: {
      x: { title: { display: true, text: "Broker" } },
      y: {
        title: { display: true, text: "Number of customers " },
        beginAtZero: true,
      },
    },
  };

  return (
    <Card className="p-4">
      {hasData ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="text-center text-gray-400 py-8">{noDataMessage}</div>
      )}
    </Card>
  );
}
