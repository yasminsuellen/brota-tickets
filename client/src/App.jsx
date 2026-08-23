import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Organizador from './pages/Organizador';
import Catalogo from './pages/Catalogo';
import CriarEvento from './pages/CriarEvento';
import GerenciarEvento from './pages/GerenciarEvento';
import Home from './pages/Home';
import Cliente from './pages/Cliente';
import EventDetail from './pages/EventDetail';
import Reservar from './pages/Reservar';
import Pagamento from './pages/Pagamento';
import MeusIngressos from './pages/MeusIngressos';
import TicketDetail from './pages/TicketDetail';
import Portaria from './pages/Portaria';

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/eventos" element={<ProtectedRoute><Cliente /></ProtectedRoute>} />
        <Route path="/eventos/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="/eventos/:id/reservar" element={<ProtectedRoute role="CLIENTE"><Reservar /></ProtectedRoute>} />
        <Route path="/reservas/:id/pagamento" element={<ProtectedRoute role="CLIENTE"><Pagamento /></ProtectedRoute>} />
        <Route path="/meus-ingressos" element={<ProtectedRoute role="CLIENTE"><MeusIngressos /></ProtectedRoute>} />
        <Route path="/ingressos/:id" element={<TicketDetail />} />
        <Route path="/organizador" element={<ProtectedRoute role="ORGANIZADOR"><Organizador /></ProtectedRoute>} />
        <Route path="/organizador/catalogo" element={<ProtectedRoute role="ORGANIZADOR"><Catalogo /></ProtectedRoute>} />
        <Route path="/organizador/eventos/novo" element={<ProtectedRoute role="ORGANIZADOR"><CriarEvento /></ProtectedRoute>} />
        <Route path="/organizador/eventos/:id" element={<ProtectedRoute role="ORGANIZADOR"><GerenciarEvento /></ProtectedRoute>} />
        <Route path="/portaria" element={<ProtectedRoute role="PORTARIA"><Portaria /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}

export default App;