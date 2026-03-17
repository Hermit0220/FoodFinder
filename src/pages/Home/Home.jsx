import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMap } from '../../context/MapContext';
import { Search as SearchIcon, Star, MapPin as MapPinIcon } from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { google, map, userLocation } = useMap();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
        if (google && map && userLocation) {
            try {
                const { Place } = google.maps.places;
                const { places } = await Place.searchNearby({
                    fields: ["displayName", "location", "rating", "userRatingCount", "photos", "formattedAddress", "id"],
                    locationRestriction: {
                        center: userLocation,
                        radius: 5000,
                    },
                    includedPrimaryTypes: ["restaurant"],
                    maxResultCount: 20
                });

                // Sort by pseudo-score: rating * userRatingCount
                const sorted = places
                    .sort((a, b) => ((b.rating || 0) * (b.userRatingCount || 0)) - ((a.rating || 0) * (a.userRatingCount || 0)))
                    .slice(0, 4);
                
                setRecommendations(sorted);
            } catch (err) {
                console.error('Fetch recommendations failed:', err);
            }
        }
    };
    
    fetchRecommendations();
  }, [google, map, userLocation]);

  return (
    <div className="home-page fade-in">
      <section className="hero">
        <div className="container hero-content">
          <h1>Find the Perfect Restaurant Near You</h1>
          <p>Discover top-rated dining experiences curated just for you.</p>
          <div className="search-bar-container">
            <input 
                type="text" 
                placeholder="Search by restaurant name, cuisine..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn-primary">Find Restaurants</button>
          </div>
        </div>
      </section>
      
      <section className="container section">
        <h2 className="section-title">Popular Cuisines</h2>
        <div className="cuisine-grid">
          {['Italian', 'Japanese', 'Mexican', 'Indian', 'French', 'Chinese'].map(c => (
            <div key={c} className="cuisine-card" onClick={() => navigate(`/search?q=${c}`)}>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="container section recommendations-section">
            <h2 className="section-title">Recommended For You</h2>
            <div className="reco-grid">
                {recommendations.map(rest => (
                    <div key={rest.id} className="reco-card" onClick={() => navigate(`/restaurant/${rest.id}`)}>
                        <div className="reco-image" style={{ backgroundImage: `url(${rest.photos?.[0]?.getURI({ maxWidth: 400 }) || 'https://via.placeholder.com/300x200?text=No+Image'})` }}></div>
                        <div className="reco-info">
                            <h4>{rest.displayName}</h4>
                            <div className="reco-meta">
                                <span className="rating"><Star size={14} fill="#ffb400" color="#ffb400" /> {rest.rating}</span>
                                <span className="reco-address"><MapPinIcon size={12} /> {rest.shortAddress || rest.formattedAddress}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      )}
    </div>
  );
};

export default Home;
