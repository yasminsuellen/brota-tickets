import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Organizador from './pages/Organizador';
import Catalogo from './pages/Catalogo';
import CriarEvento from './pages/CriarEvento';
import GerenciarEvento from './pages/GerenciarEvento';
import Cliente from './pages/Cliente';
import Portaria from './pages/Portaria';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Cliente />} />
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