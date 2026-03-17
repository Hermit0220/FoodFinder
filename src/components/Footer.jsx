import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-info">
            <h3>Food<span>Finder</span></h3>
            <p>Discover the best places to eat around you with ease.</p>
          </div>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/search">Explore</Link>
            <Link to="/#">Privacy Policy</Link>
            <Link to="/#">Terms of Service</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FoodFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
