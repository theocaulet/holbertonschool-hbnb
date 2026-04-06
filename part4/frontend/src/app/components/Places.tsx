import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Star, MapPin, Users, Home as HomeIcon, Filter } from "lucide-react";

// Image locale servie depuis le dossier public de l'app Vite
const featuredImage = "/Appartement%201.jpg";
const placeImages = [
  {
    url: featuredImage,
    featured: true,
  },
  {
    url: "https://images.unsplash.com/photo-1715985160053-d339e8b6eb94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBhcGFydG1lbnR8ZW58MXx8fHwxNzc1NDM3ODg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    featured: false,
  },
  {
    url: "https://images.unsplash.com/photo-1752769041878-f24e37fd6aea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdmlsbGElMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzU0OTkyOTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    featured: false,
  },
  {
    url: "https://images.unsplash.com/photo-1768413292179-d958b344f1d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBsb2Z0JTIwYmVkcm9vbXxlbnwxfHx8fDE3NzU0OTkyOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    featured: false,
  },
  {
    url: "https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcGVudGhvdXNlJTIwdmlld3xlbnwxfHx8fDE3NzU0OTkyOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    featured: false,
  },
  {
    url: "https://images.unsplash.com/photo-1757937176646-d943553b5f09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYWJpbiUyMG5hdHVyZXxlbnwxfHx8fDE3NzU0OTkyOTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    featured: false,
  },
  {
    url: "https://images.unsplash.com/photo-1630361138957-a5d7f88b2d94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWFjaCUyMGhvdXNlfGVufDF8fHx8MTc3NTQ3MTgyOXww&ixlib=rb-4.1.0&q=80&w=1080",
    featured: false,
  },
];

const API_BASE_URL = "/api/v1";

type PlaceFromApi = {
  id: string;
  title: string;
  description?: string;
  price: number;
  latitude?: number;
  longitude?: number;
  owner_id?: string;
};

type Place = PlaceFromApi & {
  image: string;
  featured?: boolean;
  rating: number;
  reviews: number;
  guests: number;
  bedrooms: number;
  location: string;
};

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
  return null;
}

function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || decoded.identity || decoded.user_id || null;
  } catch {
    return null;
  }
}

export function Places() {
  const [priceRange, setPriceRange] = useState<string>("all");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newPlaceId, setNewPlaceId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Récupère l'ID du dernier lieu créé depuis le stockage
    try {
      const storedId = window.localStorage.getItem("hbnb_new_place_id");
      if (storedId) {
        setNewPlaceId(storedId);
        window.localStorage.removeItem("hbnb_new_place_id");
      }
    } catch {
      // ignore storage errors
    }
  }, [location.key]);

  useEffect(() => {
    const token = getTokenFromCookie();
    const userId = getUserIdFromToken(token);
    setCurrentUserId(userId);
  }, [location.pathname]);

  useEffect(() => {
    async function loadPlaces() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/places/`);
        if (!response.ok) {
          throw new Error("Failed to load places");
        }

        const data: PlaceFromApi[] = await response.json();
        const enhanced: Place[] = data.map((place, index) => {
          const imageInfo = placeImages[index % placeImages.length];
          const hasCoordinates =
            typeof place.latitude === "number" &&
            typeof place.longitude === "number";

          // Rating et nombre de reviews aléatoires pour les lieux existants
          const randomRating = 3 + Math.random() * 2; // 3.0 - 5.0
          const randomReviews = Math.floor(20 + Math.random() * 180); // 20 - 199

          return {
            ...place,
            image: imageInfo.url,
            featured: imageInfo.featured,
            rating: randomRating,
            reviews: randomReviews,
            guests: 4,
            bedrooms: 2,
            location: hasCoordinates
              ? `${place.latitude?.toFixed(2)}, ${place.longitude?.toFixed(2)}`
              : "Location unavailable",
          };
        });

        setPlaces(enhanced);
      } catch (e) {
        setError("Unable to load places from the API.");
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl mb-3">Exceptional Places</h1>
            <p className="text-muted-foreground text-lg font-light">
              Discover your perfect stay from our curated collection
            </p>
          </div>
          <Link
            to="/places/new"
            className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm whitespace-nowrap"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            List your place
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 pb-6 border-b border-border">
          <button
            className={`px-6 py-2 rounded-full border transition-colors ${
              priceRange === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-foreground"
            }`}
            onClick={() => setPriceRange("all")}
          >
            All Places
          </button>
          <button
            className={`px-6 py-2 rounded-full border transition-colors ${
              priceRange === "budget"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-foreground"
            }`}
            onClick={() => setPriceRange("budget")}
          >
            Under $400
          </button>
          <button
            className={`px-6 py-2 rounded-full border transition-colors ${
              priceRange === "mid"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-foreground"
            }`}
            onClick={() => setPriceRange("mid")}
          >
            $400 - $600
          </button>
          <button
            className={`px-6 py-2 rounded-full border transition-colors ${
              priceRange === "luxury"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-foreground"
            }`}
            onClick={() => setPriceRange("luxury")}
          >
            $600+
          </button>
          {currentUserId && (
            <button
              className={`px-6 py-2 rounded-full border transition-colors ${
                showOnlyMine
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground"
              }`}
              onClick={() => setShowOnlyMine((prev) => !prev)}
            >
              My places
            </button>
          )}
          <button className="ml-auto px-6 py-2 rounded-full border border-border hover:border-foreground transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>

        {/* Status messages */}
        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}
        {!error && loading && (
          <p className="text-muted-foreground mb-4">Loading places...</p>
        )}

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {places
            // Masquer les appartements de test
            .filter((place) => !/test/i.test(place.title))
            .filter((place) => {
              if (!showOnlyMine) return true;
              if (!currentUserId) return false;
              return place.owner_id === currentUserId;
            })
            .filter((place) => {
              if (priceRange === "all") return true;
              if (priceRange === "budget") return place.price < 400;
              if (priceRange === "mid") return place.price >= 400 && place.price <= 600;
              if (priceRange === "luxury") return place.price > 600;
              return true;
            })
            .map((place, index) => (
              <Link
                key={place.id}
                to={`/places/${place.id}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[4/3]">
                  <img
                    src={place.image}
                    alt={place.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {place.featured && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-1 rounded-full text-sm">
                      Featured
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                    ${place.price}/night
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="group-hover:text-primary transition-colors">
                      {place.title}
                    </h3>
                    {newPlaceId !== place.id && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="font-medium">{place.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-light">{place.location}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{place.guests} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HomeIcon className="w-4 h-4" />
                      <span>{place.bedrooms} bedrooms</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground font-light">
                    {newPlaceId === place.id
                      ? "New • No reviews yet"
                      : `${place.reviews} reviews`}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
