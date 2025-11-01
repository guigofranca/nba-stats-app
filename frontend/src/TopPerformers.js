import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function TopPerformers() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // MUDANÇA AQUI: Corrigido o caminho para /data/
    fetch("/data/stats.json")
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((err) => console.error("Erro ao carregar dados:", err));
  }, []);

  if (!players.length)
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Carregando estatísticas...</p>
      </div>
    );
  
  // ... (O resto do seu código JSX continua exatamente igual) ...
  const stats = ["PTS", "REB", "AST", "STL", "BLK", "TO"];

  // Função para pegar top 5 de cada estatística
  const getTopPlayers = (stat) =>
    [...players]
      .filter((p) => p[stat] != null)
      .sort((a, b) => b[stat] - a[stat])
      .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-800/70 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6 " >
        <h1 className="text-3xl font-bold text-orange-400">
          LÍDERES EM ESTATÍSTICAS
        </h1>
        <Link to="/" className="text-orange-400 hover:underline">
          ← Voltar
        </Link>
      </div>

      {stats.map((stat) => {
        const leaders = getTopPlayers(stat);
        const labels = leaders.map((p) => p.NAME);
        const values = leaders.map((p) => p[stat]);

        return (
          <div key={stat} className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-200 mb-2">
              {stat === "PTS"
                ? "Pontos (por jogo)"
                : stat === "REB"
                ? "Rebotes (por jogo)"
                : stat === "AST"
                ? "Assistências (por jogo)"
                : stat === "STL"
                ? "Roubos (por jogo)"
                : stat === "BLK"
                ? "Tocos (por jogo)"
                : "Turnovers (por jogo)"}{" "}
            </h2>

            {/* Gráfico */}
            <div className="bg-gray-900 p-4 rounded-xl">
              <Bar
                data={{
                  labels,
                  datasets: [
                    {
                      label: stat,
                      data: values,
                      backgroundColor: [
                        "#f59e0b",
                        "#3b82f6",
                        "#a855f7",
                        "#4ade80",
                        "#f87171",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { color: "#ccc" } },
                    x: { ticks: { color: "#ccc" } },
                  },
                }}
              />
            </div>

            {/* Tabela mini */}
            <table className="min-w-full mt-3 text-sm text-gray-300">
              <thead className="bg-gray-700 text-orange-300 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Jogador</th>
                  <th className="px-4 py-2 text-center">{stat}</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((p, i) => (
                  <tr
                    key={p.NAME}
                    className={`${
                      i % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                    } border-b border-gray-600`}
                  >
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{p.NAME}</td>
                    <td className="px-4 py-2 text-center text-orange-400 font-bold">
                      {p[stat]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}