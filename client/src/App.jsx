  import {Routes, Route} from 'react-router-dom';
  import Organizador from './pages/Organizador';
  import Cliente from './pages/Cliente';
  import Portaria from './pages/Portaria';

  function App() {
    return(
      <Routes>
        <Route path="/" element={<Cliente />} />
        <Route path="/organizador" element={<Organizador />} />
        <Route path="/portaria" element={<Portaria />} />
      </Routes>
    );
  }

  export default App;