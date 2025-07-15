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

export default function BarChartBrokers({ labels, data, title }) {
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
  console.log("BarChart labels:", labels);
  console.log("BarChart data:", data);
  return (
    <Card className="p-4">
      <Bar data={chartData} options={options} />
    </Card>
  );
}
