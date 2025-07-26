import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { FolderCheck, ListTodo, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import PomodoroTimer from "../../components/dashboard/PomodoroTimer";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

function OverviewPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Metrics data
  const metrics = [
    {
      value: "0",
      label: "Projects Completed",
      icon: <FolderCheck size={20} className="text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      value: "0",
      label: "Clients",
      icon: <Users size={20} className="text-[#18cb96]" />,
      bgColor: "bg-[#f0f9ff]",
    },
    {
      value: "0",
      label: "Tasks Due",
      icon: <ListTodo size={20} className="text-amber-600" />,
      bgColor: "bg-amber-50",
    },
    {
      value: "0",
      label: "Pending Invoices",
      icon: <Wallet size={20} className="text-green-600" />,
      bgColor: "bg-green-50",
    },
  ];

  // Chart data for revenue over time
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        fill: true,
        label: "Revenue",
        data: [0, 0, 0, 0, 0, 0],
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.1)",
        tension: 0.4,
        pointBackgroundColor: "red",
        pointBorderColor: "red",
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Date",
          position: "left",
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: "Revenue",
          position: "bottom",
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  // No task manipulation functions needed anymore

  return (
    <div className="space-y-6">
      {/* Metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
            {isLoading ? (
              <div className="animate-pulse flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  {metric.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-gray-500">{metric.label}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <PomodoroTimer />
        )}

        {/* Income overtime chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Income overtime</h2>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;
