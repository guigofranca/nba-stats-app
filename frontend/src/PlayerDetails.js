import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import { nameKey, formatTimestamp } from "./utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


// times com seus respectivos nomes/abreviações e logos
const TEAM_MAP = {
  ATL: { name: "Atlanta Hawks", logo: "https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg" },
  BOS: { name: "Boston Celtics", logo: "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg" },
  BKN: { name: "Brooklyn Nets", logo: "https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg" },
  CHA: { name: "Charlotte Hornets", logo: "https://cdn.nba.com/logos/nba/1610612766/primary/L/logo.svg" },
  CHI: { name: "Chicago Bulls", logo: "https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg" },
  CLE: { name: "Cleveland Cavaliers", logo: "https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg" },
  DAL: { name: "Dallas Mavericks", logo: "https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg" },
  DEN: { name: "Denver Nuggets", logo: "https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg" },
  DET: { name: "Detroit Pistons", logo: "https://cdn.nba.com/logos/nba/1610612765/primary/L/logo.svg" },
  GSW: { name: "Golden State Warriors", logo: "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg" },
  HOU: { name: "Houston Rockets", logo: "https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg" },
  IND: { name: "Indiana Pacers", logo: "https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg" },
  LAC: { name: "LA Clippers", logo: "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg" },
  LAL: { name: "Los Angeles Lakers", logo: "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg" },
  MEM: { name: "Memphis Grizzlies", logo: "https://cdn.nba.com/logos/nba/1610612763/primary/L/logo.svg" },
  MIA: { name: "Miami Heat", logo: "https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg" },
  MIL: { name: "Milwaukee Bucks", logo: "https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg" },
  MIN: { name: "Minnesota Timberwolves", logo: "https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg" },
  NOP: { name: "New Orleans Pelicans", logo: "https://cdn.nba.com/logos/nba/1610612740/primary/L/logo.svg" },
  NYK: { name: "New York Knicks", logo: "https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg" },
  OKC: { name: "Oklahoma City Thunder", logo: "https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg" },
  ORL: { name: "Orlando Magic", logo: "https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg" },
  PHI: { name: "Philadelphia 76ers", logo: "https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg" },
  PHX: { name: "Phoenix Suns", logo: "https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg" },
  POR: { name: "Portland Trail Blazers", logo: "https://cdn.nba.com/logos/nba/1610612757/primary/L/logo.svg" },
  SAC: { name: "Sacramento Kings", logo: "https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg" },
  SAS: { name: "San Antonio Spurs", logo: "https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg" },
  TOR: { name: "Toronto Raptors", logo: "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg" },
  UTA: { name: "Utah Jazz", logo: "https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg" },
  WAS: { name: "Washington Wizards", logo: "https://cdn.nba.com/logos/nba/1610612764/primary/L/logo.svg" },
  TOT: { name: "Múltiplos Times", logo: "https://cdn.nba.com/logos/nba/nba/primary/L/nba-logoman-word-white.svg" },
};

export default function PlayerDetails() {
  const navigate = useNavigate();
  const { name } = useParams();
  const [player, setPlayer] = useState(null);
  const [playerImg, setPlayerImg] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/data/stats.json");
        const data = await res.json();
        const decoded = decodeURIComponent(name);
        const targetKey = nameKey(decoded); // Usando a função importada

        const found =
          data.find((p) => nameKey(p.NAME) === targetKey) ||
          data.find((p) => nameKey(p.NAME).includes(targetKey)) ||
          data.find((p) => targetKey.includes(nameKey(p.NAME)));

        if (!found) {
          console.warn("Jogador não encontrado:", decoded);
          setError(true);
          return;
        }
        setPlayer(found);
      } catch (e) {
        console.error("Erro lendo stats.json:", e);
        setError(true);
      }
    };
    run();
  }, [name]);

  // imagem jogador
  useEffect(() => {
    if (!player) return;

    const getNBAImage = async () => {
      try {

        const res = await fetch("/data/nba_players.json");
        const rawData = await res.json();
        const list = Array.isArray(rawData)
          ? rawData
          : rawData.players
            ? rawData.players
            : [];

        const target = nameKey(player.NAME);
        const match =
          list.find(
            (p) =>
              nameKey(`${p.firstName || p.first_name} ${p.lastName || p.last_name}`) === target
          ) ||
          list.find((p) =>
            nameKey(
              `${p.firstName || p.first_name} ${p.lastName || p.last_name}`
            ).includes(target)
          );

        if (match) {
          const img =
            match.headshot_url ||
            `https://cdn.nba.com/headshots/nba/latest/1040x760/${match.id || match.player_id
            }.png`;
          setPlayerImg(img);
        } else setPlayerImg(null);
      } catch (e) {
        console.warn("Falha lendo nba_players.json:", e);
        setPlayerImg(null);
      }
    };

    getNBAImage();
  }, [player]);

  if (error)
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Jogador não encontrado.</p>
        <Link to="/" className="text-orange-400 hover:underline mt-4 inline-block">
          ← Voltar
        </Link>
      </div>
    );

  if (!player)
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Carregando informações...</p>
      </div>
    );

  const team = TEAM_MAP[player.TEAM] || { name: player.TEAM, logo: null };
  const stats = ["PTS", "REB", "AST", "STL", "BLK", "TO"];
  const labels = stats;
  const data = stats.map((s) => player[s]);

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-gray-800/70 p-6 rounded-2xl shadow-lg">
      <button
        onClick={() => navigate(-1)}
        className="text-orange-400 hover:underline"
      >
        ← Voltar
      </button>

      <div className="flex flex-col items-center mt-4">
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-orange-400 mb-4 bg-gray-900">
          <img
            src={
              playerImg ||
              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            }
            alt={player.NAME}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-3xl font-bold text-orange-400 mb-2">
          {player.NAME}
        </h2>

        {/* Logo e nome completo do time */}
        <div className="flex flex-col items-center mb-6">
          {team.logo && (
            <img
              src={team.logo}
              alt={team.name}
              className="w-16 h-16 object-contain mb-2"
            />
          )}
          <p className="text-gray-300 font-semibold">{team.name}</p>
          <p className="text-gray-400 text-sm">Posição: {player.POS || "-"}</p>
        </div>
      </div>

      {/* gráfico */}
      <div className="bg-gray-900 p-4 rounded-xl mb-6">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Estatísticas",
                data,
                backgroundColor: [
                  "#f59e0b",
                  "#3b82f6",
                  "#a855f7",
                  "#4ade80",
                  "#f87171",
                  "#eab308",
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

      {/* tabela */}
      <table className="min-w-full text-sm md:text-base">
        <thead className="bg-gray-700 text-orange-300 uppercase text-xs sm:text-sm">
          <tr>
            <th className="px-4 py-2 text-left">GP</th>
            <th className="px-4 py-2 text-center">MIN</th>
            <th className="px-4 py-2 text-center">PTS</th>
            <th className="px-4 py-2 text-center">REB</th>
            <th className="px-4 py-2 text-center">AST</th>
            <th className="px-4 py-2 text-center">STL</th>
            <th className="px-4 py-2 text-center">BLK</th>
            <th className="px-4 py-2 text-center">TO</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-800 border-b border-gray-700">
            <td className="px-4 py-2">{player.GP}</td>
            <td className="px-4 py-2 text-center">{player.MIN}</td>
            <td className="px-4 py-2 text-center text-green-400">{player.PTS}</td>
            <td className="px-4 py-2 text-center text-blue-400">{player.REB}</td>
            <td className="px-4 py-2 text-center text-purple-400">{player.AST}</td>
            <td className="px-4 py-2 text-center">{player.STL}</td>
            <td className="px-4 py-2 text-center">{player.BLK}</td>
            <td className="px-4 py-2 text-center">{player.TO}</td>
          </tr>
        </tbody>
      </table>

      <p className="text-center text-gray-400 text-sm mt-6">
        Última atualização: {formatTimestamp(player.UPDATED_AT)}
      </p>
    </div>
  );
}