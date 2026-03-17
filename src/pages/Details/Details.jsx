import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMap } from '../../context/MapContext';
import { Phone, MapPin, Clock, Globe, Star, ChevronLeft, Navigation } from 'lucide-react';
import './Details.css';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const { google, map, userLocation } = useMap();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [miniMap, setMiniMap] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (google && map && id) {
        try {
          const { Place } = google.maps.places;
          const place = new Place({ id });
          
          await place.fetchFields({
            fields: [
              "displayName", "formattedAddress", "location", "rating", 
              "userRatingCount", "priceLevel", "photos", "reviews", 
              "types", "websiteUri", "internationalPhoneNumber", "regularOpeningHours"
            ],
          });
          
          setRestaurant(place);
          setLoading(false);
        } catch (err) {
          console.error('Fetch Details failed:', err);
          setLoading(false);
        }
      }
    };
    
    fetchDetails();
  }, [google, map, id]);

  useEffect(() => {
    if (google && restaurant && mapRef.current && !miniMap) {
        const newMiniMap = new google.maps.Map(mapRef.current, {
            center: restaurant.location,
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: false,
        });

        new google.maps.Marker({
            position: restaurant.location,
            map: newMiniMap,
            title: restaurant.displayName
        });

        setMiniMap(newMiniMap);
    }
  }, [google, restaurant, miniMap]);

  const handleGetDirections = () => {
    if (!google || !userLocation || !restaurant) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(restaurant.formattedAddress)}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) return <div className="container section">Loading...</div>;
  if (!restaurant) return <div className="container section">Restaurant not found.</div>;

  return (
    <div className="details-page fade-in">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ChevronLeft size={20} /> Back to Search
        </button>

        <div className="details-header">
          <div className="details-main-info">
            <h1>{restaurant.displayName}</h1>
            <div className="rating-summary">
              <Star className="star-icon" fill="#ffb400" color="#ffb400" size={20} />
              <span className="rating-score">{restaurant.rating}</span>
              <span className="review-count">({restaurant.userRatingCount} reviews)</span>
              <span className="price-range"> • {restaurant.priceLevel ? '$'.repeat(restaurant.priceLevel) : '$$'}</span>
            </div>
            <p className="cuisine-type">{restaurant.types?.join(', ').replace(/_/g, ' ')}</p>
          </div>
          <div className="details-actions">
            <button onClick={handleShare} className="btn-secondary">
                Share
            </button>
            <button onClick={handleGetDirections} className="btn-primary-large">
                <Navigation size={20} /> Get Directions
            </button>
          </div>
        </div>

        <div className="details-grid">
          <div className="details-left">
            <section className="gallery">
                {restaurant.photos?.slice(0, 4).map((photo, i) => (
                    <img key={i} src={photo.getURI({ maxWidth: 800 })} alt={`${restaurant.displayName} ${i}`} />
                ))}
            </section>

            <section className="reviews-section">
                <h2>Recent Reviews</h2>
                <div className="reviews-list">
                    {restaurant.reviews?.map((review, i) => (
                        <div key={i} className="review-card">
                            <div className="review-user">
                                <img src={review.authorAttribution?.photoUri} alt={review.authorAttribution?.displayName} />
                                <div>
                                    <h5>{review.authorAttribution?.displayName}</h5>
                                    <span>{review.relativePublishTimeDescription}</span>
                                </div>
                            </div>
                            <div className="review-stars">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} size={14} fill={j < review.rating ? "#ffb400" : "none"} color="#ffb400" />
                                ))}
                            </div>
                            <p>{review.text}</p>
                        </div>
                    ))}
                </div>
            </section>
          </div>

          <aside className="details-sidebar">
            <div className="contact-card">
                <h3>Information</h3>
                <div className="info-item">
                    <MapPin size={20} />
                    <p>{restaurant.formattedAddress}</p>
                </div>
                <div className="info-item">
                    <Phone size={20} />
                    <p>{restaurant.internationalPhoneNumber || 'N/A'}</p>
                </div>
                {restaurant.websiteUri && (
                    <div className="info-item">
                        <Globe size={20} />
                        <a href={restaurant.websiteUri} target="_blank" rel="noreferrer">Visit Website</a>
                    </div>
                )}
                <div className="info-item">
                    <Clock size={20} />
                    <div className="hours-list">
                        {restaurant.regularOpeningHours?.weekdayDescriptions.map((day, i) => (
                            <p key={i}>{day}</p>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mini-map-container" ref={mapRef}></div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Details;
