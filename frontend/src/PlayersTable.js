import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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

export default function PlayersTable() {
    const [players, setPlayers] = useState([]);
    const [playerImages, setPlayerImages] = useState({});

    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("page")) || 1;
    const searchTerm = searchParams.get("search") || "";
    const filterPos = searchParams.get("pos") || "";
    const filterTeam = searchParams.get("team") || "";
    const sortKey = searchParams.get("sort") || "PTS";
    const sortOrder = searchParams.get("order") || "desc";
    const itemsPerPage = 40;
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/data/stats.json")
            .then((res) => res.json())
            .then((data) => setPlayers(data))
            .catch((err) => console.error("Erro ao carregar dados:", err));
    }, []);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch("/data/nba_players.json");
                const data = await res.json();
                const list = Array.isArray(data) ? data : data.players || [];
                const imgs = {};

                list.forEach((p) => {
                    const id = p.id || p.player_id;
                    const fullName = `${p.firstName || p.first_name} ${p.lastName || p.last_name}`;
                    imgs[nameKey(fullName)] =
                        p.headshot_url ||
                        `https://cdn.nba.com/headshots/nba/latest/260x190/${id}.png`;
                });

                setPlayerImages(imgs);
            } catch (err) {
                console.error("Erro ao carregar imagens:", err);
            }
        };

        fetchImages();
    }, []);

    // Filtro + ordenação
    const filteredPlayers = useMemo(() => {
        let filtered = players;

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (p) => p.NAME.toLowerCase().includes(q) || p.TEAM.toLowerCase().includes(q)
            );
        }
        if (filterPos) filtered = filtered.filter((p) => p.POS === filterPos);
        if (filterTeam)
            filtered = filtered.filter(
                (p) => p.TEAM.toLowerCase() === filterTeam.toLowerCase()
            );

        return filtered.sort((a, b) => {
            const aVal = a[sortKey] ?? 0;
            const bVal = b[sortKey] ?? 0;
            return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        });
    }, [players, searchTerm, filterPos, filterTeam, sortKey, sortOrder]);


    const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage) || 1;
    const currentPlayers = filteredPlayers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages) {
            setSearchParams(prev => {
                prev.set("page", p.toString());
                return prev;
            });
            const anchor = document.getElementById("players-table-top");
            anchor?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleSort = (key) => {
        const newOrder = (key === sortKey && sortOrder === "desc") ? "asc" : "desc";
        setSearchParams(prev => {
            prev.set("sort", key);
            prev.set("order", newOrder);
            prev.set("page", "1");
            return prev;
        });
    };

    const handleSearch = (q) => {
        setSearchParams(prev => {
            prev.set("search", q);
            prev.set("page", "1");
            return prev;
        });
    };

    const handleFilterPos = (pos) => {
        setSearchParams(prev => {
            prev.set("pos", pos);
            prev.set("page", "1");
            return prev;
        });
    };

    const handleFilterTeam = (team) => {
        setSearchParams(prev => {
            prev.set("team", team);
            prev.set("page", "1");
            return prev;
        });
    };

    const uniquePositions = [...new Set(players.map((p) => p.POS).filter(Boolean))];
    const uniqueTeams = [...new Set(players.map((p) => p.TEAM).filter(Boolean))];

    return (
        <div className="max-w-7xl mx-auto mt-10 bg-gray-800/70 p-4 md:p-6 rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-orange-400 mb-3 sm:mb-0">
                    Estatísticas NBA - Todos os Jogadores
                </h1>
                <Link
                    to="/leaders"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md shadow-md"
                >
                    🏆 Ver Top 5
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-center items-center mb-6">
                <input
                    type="text"
                    placeholder="Buscar por jogador ou time..."
                    className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                />

                <select
                    value={filterPos}
                    onChange={(e) => handleFilterPos(e.target.value)}
                    className="px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-800 bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
                >
                    <option value="">Todas as posições</option>
                    {uniquePositions.map((pos) => (
                        <option key={pos} value={pos}>
                            {pos}
                        </option>
                    ))}
                </select>

                <select
                    value={filterTeam}
                    onChange={(e) => handleFilterTeam(e.target.value)}
                    className="px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-800 bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
                >
                    <option value="">Todos os times</option>
                    {uniqueTeams.map((team) => (
                        <option key={team} value={team}>
                            {team}
                        </option>
                    ))}
                </select>
            </div>

            <div id="players-table-top" />

            <div className="overflow-x-auto rounded-lg ring-1 ring-gray-700">
                <table className="min-w-full text-sm md:text-base border-collapse">
                    <thead className="bg-gray-700 text-orange-300 uppercase text-xs sm:text-sm">
                        <tr>
                            <th className="px-4 py-3 text-left">Jogador</th>
                            <th className="px-4 py-3 text-center">Time</th>
                            <th className="px-4 py-3 text-center">Posição</th>
                            {["PTS", "REB", "AST", "STL", "BLK", "TO", "MIN"].map((key) => (
                                <th
                                    key={key}
                                    className="px-4 py-3 text-center cursor-pointer hover:text-orange-400 select-none"
                                    onClick={() => handleSort(key)}
                                    title={`Ordenar por ${key}`}
                                >
                                    {key}
                                    {sortKey === key ? (sortOrder === "asc" ? " ▲" : " ▼") : ""}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentPlayers.length > 0 ? (
                            currentPlayers.map((p, i) => {
                                const img =
                                    playerImages[nameKey(p.NAME)] ||
                                    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

                                return (
                                    <tr
                                        key={`${p.NAME}-${i}`}
                                        onClick={() => navigate(`/player/${encodeURIComponent(p.NAME)}`)}
                                        className={`border-b border-gray-700 hover:bg-gray-700/50 transition cursor-pointer ${i % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                                            }`}
                                    >
                                        <td className="px-4 py-2 flex items-center gap-3">
                                            <img
                                                src={img}
                                                alt={p.NAME}
                                                className="w-8 h-8 rounded-full object-cover border border-gray-500"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
                                                }}
                                            />
                                            <span className="font-semibold text-orange-200 whitespace-nowrap">
                                                {p.NAME}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">{p.TEAM}</td>
                                        <td className="px-4 py-2 text-center">{p.POS}</td>
                                        <td className="px-4 py-2 text-center text-green-400">{p.PTS}</td>
                                        <td className="px-4 py-2 text-center text-blue-400">{p.REB}</td>
                                        <td className="px-4 py-2 text-center text-purple-400">{p.AST}</td>
                                        <td className="px-4 py-2 text-center">{p.STL}</td>
                                        <td className="px-4 py-2 text-center">{p.BLK}</td>
                                        <td className="px-4 py-2 text-center">{p.TO}</td>
                                        <td className="px-4 py-2 text-center">{p.MIN}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="10" className="text-center py-6 text-gray-400">
                                    Nenhum jogador encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 flex-wrap gap-2">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
                    >
                        ← Anterior
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goToPage(i + 1)}
                            className={`px-3 py-1 rounded-lg ${currentPage === i + 1
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
                    >
                        Próxima →
                    </button>
                </div>
            )}

            {/* Info */}
            <p className="text-center text-gray-400 text-sm mt-4">
                Página {currentPage} de {totalPages} • Mostrando {currentPlayers.length} de{" "}
                {filteredPlayers.length} jogadores
                <br />
                Última atualização: {formatTimestamp(players[0]?.UPDATED_AT)}
            </p>
        </div>
    );
}