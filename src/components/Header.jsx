import { Link } from 'react-router-dom';
import { Search as SearchIcon, MapPin } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header glass">
      <div className="container header-content">
        <Link to="/" className="logo">
          <MapPin size={28} className="logo-icon" />
          <span>Food<span>Finder</span></span>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/search" className="nav-link">Explore</Link>
          <Link to="/search" className="search-btn">
            <SearchIcon size={20} />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
