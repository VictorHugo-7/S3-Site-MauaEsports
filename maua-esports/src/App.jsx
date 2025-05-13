import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./authConfig";
import NavBar from "./components/NavBar";
import Rodape from "./components/Rodape";
import Home from "./pages/Home";
import Membros from "./pages/Membros";
import NotFound from "./pages/NotFound";
import Times from "./pages/Times";
import Admins from "./pages/Admins";
import HorasPaePage from "./pages/HorasPae";
import TreinosAdmin from "./pages/TreinosAdmin";
import Politicas from "./pages/Politicas";
import Campeonatos from "./pages/Campeonatos";
import AdminUsuarios from "./pages/AdminUsuarios";
import NaoAutorizado from "./components/NaoAutorizado";
import ProtectedRoute from "./components/ProtectedRoute";
import Novidades from "./pages/Novidades";
import "./index.css";

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <NavBar />
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/times" element={<Times />} />
          <Route path="/times/:timeId/membros" element={<Membros />} />
          <Route path="/admins" element={<Admins />} />
          <Route path="/politicas" element={<Politicas />} />
          <Route path="/campeonatos" element={<Campeonatos />} />
          <Route path="/nao-autorizado" element={<NaoAutorizado />} />
          <Route path="/novidades" element={<Novidades />} />

          {/* Rotas protegidas */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Jogador",
                  "Capitão de time",
                  "Administrador",
                  "Administrador Geral",
                ]}
              />
            }
          >
            <Route path="/horas-pae" element={<HorasPaePage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Administrador",
                  "Administrador Geral",
                  "Capitão de time",
                ]}
              />
            }
          >
            <Route path="/admin-usuarios" element={<AdminUsuarios />} />
            <Route path="/treinos-admin" element={<TreinosAdmin />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Rodape />
      </Router>
    </MsalProvider>
  );
}

export default App;
