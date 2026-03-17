import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import Details from './pages/Details/Details';
import Header from './components/Header';
import Footer from './components/Footer';

import { MapProvider } from './context/MapContext';

function App() {
  return (
    <MapProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/restaurant/:id" element={<Details />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </MapProvider>
  );
}

export default App;
