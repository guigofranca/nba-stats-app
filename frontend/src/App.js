import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlayersTable from "./PlayersTable";
import PlayerDetails from "./PlayerDetails";
import TopPerformers from "./TopPerformers";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white px-4 md:px-10">
        <h1 className="text-center text-5xl font-bold text-orange-400 pt-6">
          NBA INFOS
        </h1>

        <Routes>
          <Route path="/" element={<PlayersTable />} />
          <Route path="/player/:name" element={<PlayerDetails />} />
          <Route path="/leaders" element={<TopPerformers />} />
        </Routes>

        <footer className="text-center text-gray-500 py-6 text-sm">
          Criado por Guilherme Silveira © 2025
        </footer>
      </div>
    </Router>
  );
}
