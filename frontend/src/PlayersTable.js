import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Link } from "react-router-dom";
// MUDANÇA AQUI: Importando a função 'nameKey'
import { nameKey } from "./utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PlayersTable() {
    const [players, setPlayers] = useState([]);
    const [playerImages, setPlayerImages] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPos, setFilterPos] = useState("");
    const [filterTeam, setFilterTeam] = useState("");
    const [sortKey, setSortKey] = useState("PTS");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 40;
    const navigate = useNavigate();

    // 📥 Carregar dados principais
    useEffect(() => {
        // MUDANÇA AQUI: Corrigido o caminho para /data/
        fetch("/data/stats.json")
            .then((res) => res.json())
            .then((data) => setPlayers(data))
            .catch((err) => console.error("Erro ao carregar dados:", err));
    }, []);

    // MUDANÇA AQUI: Removida a função 'normalize' local
    
    // 🏀 Carregar imagens dos jogadores
    useEffect(() => {
        const fetchImages = async () => {
            try {
                // MUDANÇA AQUI: Corrigido o caminho para /data/
                const res = await fetch("/data/nba_players.json");
                const data = await res.json();
                const list = Array.isArray(data) ? data : data.players || [];
                const imgs = {};

                list.forEach((p) => {
                    const id = p.id || p.player_id;
                    const fullName = `${p.firstName || p.first_name} ${p.lastName || p.last_name}`;
                    // MUDANÇA AQUI: Usando 'nameKey' para consistência
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

    // ... (O resto do código, 'filteredPlayers', 'totalPages', etc., continua igual) ...
    // 🔍 Filtro + ordenação
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

    // 📄 Paginação
    const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage) || 1;
    const currentPlayers = filteredPlayers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages) {
            setCurrentPage(p);
            const anchor = document.getElementById("players-table-top");
            anchor?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleSort = (key) => {
        if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortOrder("desc");
        }
        setCurrentPage(1);
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

            {/* 🔍 Filtros e busca */}
            <div className="flex flex-col md:flex-row gap-3 justify-center items-center mb-6">
                <input
                    type="text"
                    placeholder="Buscar por jogador ou time..."
                    className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />

                <select
                    value={filterPos}
                    onChange={(e) => {
                        setFilterPos(e.target.value);
                        setCurrentPage(1);
                    }}
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
                    onChange={(e) => {
                        setFilterTeam(e.target.value);
                        setCurrentPage(1);
                    }}
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

            {/* 🧾 Tabela principal */}
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
                                // MUDANÇA AQUI: Usando 'nameKey' para buscar a imagem
                                playerImages[nameKey(p.NAME)] ||
                                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

                            return (
                                <tr
                                    key={`${p.NAME}-${i}`}
                                    onClick={() => navigate(`/player/${encodeURIComponent(p.NAME)}`)}
                                    className={`border-b border-gray-700 hover:bg-gray-700/50 transition cursor-pointer ${
                                        i % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
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

            {/* 🔢 Paginação */}
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
                            className={`px-3 py-1 rounded-lg ${
                                currentPage === i + 1
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

            {/* ℹ️ Info */}
            <p className="text-center text-gray-400 text-sm mt-4">
                Página {currentPage} de {totalPages} • Mostrando {currentPlayers.length} de{" "}
                {filteredPlayers.length} jogadores
                <br />
                Última atualização: {players[0]?.UPDATED_AT || "carregando..."}
            </p>
        </div>
    );
}