import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMap } from '../../context/MapContext';
import MapContainer from '../../components/MapContainer';
import './Search.css';

const Search = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search).get('q') || '';
  
  const { google, map, userLocation, setRestaurants, restaurants } = useMap();
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [distanceRadius, setDistanceRadius] = useState('5000');
  const [minRating, setMinRating] = useState(0);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = async () => {
    if (!google || !map || !userLocation) return;

    setSearching(true);
    setHasSearched(true);
    
    try {
        const { Place } = google.maps.places;
        
        let results = [];
        if (searchQuery || selectedCuisine) {
            console.log('Using searchByText for:', searchQuery || selectedCuisine);
            const { places } = await Place.searchByText({
                textQuery: `${searchQuery || selectedCuisine} restaurant`,
                locationBias: { center: userLocation, radius: Number(distanceRadius) },
                fields: ["displayName", "location", "rating", "userRatingCount", "priceLevel", "formattedAddress", "id", "photos", "types"],
                maxResultCount: 20
            });
            results = places;
        } else {
            console.log('Using searchNearby');
            const { places } = await Place.searchNearby({
                fields: ["displayName", "location", "rating", "userRatingCount", "priceLevel", "formattedAddress", "id", "photos", "types"],
                locationRestriction: {
                    center: userLocation,
                    radius: Number(distanceRadius),
                },
                includedPrimaryTypes: ["restaurant"],
                maxResultCount: 20
            });
            results = places;
        }

        console.log(`Found ${results.length} results via New API`);

        // Map results to compatible format
        const mappedResults = results.map(p => ({
            place_id: p.id,
            name: p.displayName,
            geometry: { location: p.location },
            rating: p.rating,
            user_ratings_total: p.userRatingCount,
            price_level: p.priceLevel,
            vicinity: p.formattedAddress,
            photos: p.photos,
            types: p.types,
            // Helper for legacy photo access if needed
            getPhotoUrl: () => p.photos?.[0]?.getURI({ maxWidth: 400 }) || 'https://via.placeholder.com/300x200?text=No+Image'
        }));

        let filteredResults = mappedResults;
        
        // Manual rating filter
        if (minRating > 0) {
            filteredResults = filteredResults.filter(r => r.rating >= minRating);
        }

        // Sorting
        const sorted = [...filteredResults].sort((a, b) => {
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (sortBy === 'distance') {
                const distA = google.maps.geometry.spherical.computeDistanceBetween(userLocation, a.geometry.location);
                const distB = google.maps.geometry.spherical.computeDistanceBetween(userLocation, b.geometry.location);
                return distA - distB;
            }
            if (sortBy === 'popularity') return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
            return 0;
        });

        setRestaurants(sorted);
    } catch (err) {
        console.error('Places API (New) failed:', err);
        setRestaurants([]);
        alert('Failed to find restaurants. Please check your API key or connection.');
    } finally {
        setSearching(false);
    }
  };

  useEffect(() => {
    if (map && userLocation) {
      if (query) {
        handleSearch();
      } else {
        setHasSearched(false);
      }
    }
  }, [map, userLocation, query]);

  useEffect(() => {
    if (hasSearched) {
      handleSearch();
    }
  }, [selectedCuisine, distanceRadius, minRating, sortBy]);

  return (
    <div className="search-page slide-in">
      <div className="search-layout">
        <aside className="sidebar">
          <h3>Search & Filters</h3>
          <div className="filter-group">
            <label>Search Name</label>
            <div className="input-with-button">
                <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Pizza, Sushi..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="btn-small">Go</button>
            </div>
          </div>

          <div className="filter-group">
            <label>Cuisine</label>
            <select value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value)}>
                <option value="">All Cuisines</option>
                <option value="italian">Italian</option>
                <option value="japanese">Japanese</option>
                <option value="mexican">Mexican</option>
                <option value="chinese">Chinese</option>
                <option value="fast food">Fast Food</option>
                <option value="cafe">Cafe</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Distance</label>
            <select value={distanceRadius} onChange={(e) => setDistanceRadius(e.target.value)}>
                <option value="1000">Within 1 km</option>
                <option value="5000">Within 5 km</option>
                <option value="10000">Within 10 km</option>
                <option value="25000">Within 25 km</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Rating</label>
            <div className="rating-filters">
                <button className={`filter-chip ${minRating === 3 ? 'active' : ''}`} onClick={() => setMinRating(3)}>3+ ⭐</button>
                <button className={`filter-chip ${minRating === 4 ? 'active' : ''}`} onClick={() => setMinRating(4)}>4+ ⭐</button>
                <button className={`filter-chip ${minRating === 4.5 ? 'active' : ''}`} onClick={() => setMinRating(4.5)}>4.5+ ⭐</button>
                <button className={`filter-chip ${minRating === 0 ? 'active' : ''}`} onClick={() => setMinRating(0)}>All</button>
            </div>
          </div>
        </aside>

        <div className="results-container">
          <div className="results-header">
            <h2>{hasSearched ? `${restaurants.length} Restaurants Found` : 'Start Your Search'}</h2>
            <div className="sort-select">
                <span>Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="distance">Closest</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popularity">Most Reviews</option>
                </select>
            </div>
          </div>
          
          <div className="results-list">
            {searching ? (
              <div className="search-loading">Searching for magic...</div>
            ) : restaurants.length > 0 ? (
              restaurants.map(rest => (
                <div key={rest.place_id} className="restaurant-card">
                  <div className="card-image" style={{ backgroundImage: `url(${rest.getPhotoUrl()})` }}></div>
                  <div className="card-info">
                    <h4>{rest.name}</h4>
                    <div className="card-meta">
                      <span className="rating">{rest.rating} ⭐</span>
                      <span className="price">{rest.price_level ? '$'.repeat(rest.price_level) : '$$'}</span>
                    </div>
                    <p className="address">{rest.vicinity}</p>
                    <button onClick={() => navigate(`/restaurant/${rest.place_id}`)} className="btn-details">View Details</button>
                  </div>
                </div>
              ))
            ) : hasSearched ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <h3>No Restaurants Found</h3>
                <p>Try adjusting your filters or searching for something else.</p>
                <button onClick={() => { setSearchQuery(''); setSelectedCuisine(''); setMinRating(0); handleSearch(); }} className="btn-secondary">Clear All Filters</button>
              </div>
            ) : (
                <div className="search-prompt">
                    <h3>Find your next favorite meal</h3>
                    <p>Enter a name or select a cuisine to start searching.</p>
                </div>
            )}
          </div>
        </div>

        <div className="map-view">
          <MapContainer />
        </div>
      </div>
    </div>
  );
};

export default Search;
