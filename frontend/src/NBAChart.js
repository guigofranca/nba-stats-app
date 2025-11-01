import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function NBAChart() {
  const [players, setPlayers] = useState([]);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    // MUDANÇA AQUI: Corrigido o caminho para /data/
    fetch("/data/stats.json")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data);
        if (data.length > 0 && data[0].UPDATED_AT) {
          setLastUpdate(data[0].UPDATED_AT);
        }
      })
      .catch((err) => console.error("Erro ao carregar dados:", err));
  }, []);

  const chartData = {
    labels: players.map((p) => p.NAME),
    datasets: [
      {
        label: "Pontos (PTS)",
        data: players.map((p) => p.PTS),
        backgroundColor: "#f59e0b", // Amarelo NBA
      },
      {
        label: "Rebotes (REB)",
        data: players.map((p) => p.REB),
        backgroundColor: "#3b82f6", // Azul
      },
      {
        label: "Assistências (AST)",
        data: players.map((p) => p.AST),
        backgroundColor: "#22c55e", // Verde
      },
    ],
  };
  
  // ... (O resto do seu código JSX continua exatamente igual) ...
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#fff" } },
      title: {
        display: true,
        text: "Top 10 Jogadores - Estatísticas NBA",
        color: "#fbbf24",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      x: { ticks: { color: "#ddd" } },
      y: { ticks: { color: "#ddd" } },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full">
        <Bar data={chartData} options={options} />
      </div>

      {lastUpdate && (
        <p className="text-gray-400 text-sm mt-4 italic">
          Última atualização: {lastUpdate}
        </p>
      )}

      {/* Cards de estatísticas extras */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 w-full">
        {players.map((p, i) => (
          <div
            key={i}
            className="bg-[#1f2937] rounded-xl p-4 shadow-md border border-gray-700 hover:scale-105 transition"
          >
            <h2 className="text-lg font-bold text-accent mb-2">{p.NAME}</h2>
            <p className="text-sm text-gray-300 mb-1">
              Time: <span className="text-white">{p.TEAM}</span>
            </p>
            <p className="text-sm text-gray-300 mb-1">
              PTS: <span className="text-white">{p.PTS}</span>
            </p>
            <p className="text-sm text-gray-300 mb-1">
              REB: <span className="text-white">{p.REB}</span>
            </p>
            <p className="text-sm text-gray-300">
              AST: <span className="text-white">{p.AST}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}