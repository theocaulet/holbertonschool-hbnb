import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { MapPin, DollarSign, Layers, PlusCircle } from "lucide-react";

// Utilise le proxy Vite /api pour communiquer avec le backend Flask
const API_BASE_URL = "/api/v1";

type Amenity = {
  id: string;
  name: string;
};

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
  return null;
}

export function CreatePlace() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadAmenities() {
      try {
        const response = await fetch(`${API_BASE_URL}/amenities/`);
        if (!response.ok) {
          return;
        }
        const data: Amenity[] = await response.json();

        // Supprimer les doublons par nom (insensible à la casse) et trier par nom
        const seenNames = new Map<string, Amenity>();
        for (const amenity of data) {
          const key = amenity.name.trim().toLowerCase();
          if (!seenNames.has(key)) {
            seenNames.set(key, amenity);
          }
        }
        const cleaned = Array.from(seenNames.values()).sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );

        setAmenities(cleaned);
      } catch {
        // On garde la page utilisable même si les amenities ne chargent pas
      }
    }

    loadAmenities();
  }, []);

  function toggleAmenity(id: string) {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const token = getTokenFromCookie();
    if (!token) {
      navigate("/login");
      return;
    }

    if (!title.trim() || !price || !latitude || !longitude) {
      setError("Please fill in all required fields.");
      return;
    }

    const priceValue = parseFloat(price);
    const latValue = parseFloat(latitude);
    const lonValue = parseFloat(longitude);

    if (Number.isNaN(priceValue) || Number.isNaN(latValue) || Number.isNaN(lonValue)) {
      setError("Price, latitude and longitude must be valid numbers.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/places/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          price: priceValue,
          latitude: latValue,
          longitude: lonValue,
          amenities: selectedAmenities,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          (errorData && (errorData.error || errorData.msg)) ||
          "Unable to create place. Please try again.";
        throw new Error(errorMessage);
      }

      const createdPlace = await response.json().catch(() => null);
      if (createdPlace && createdPlace.id) {
        try {
          window.localStorage.setItem("hbnb_new_place_id", createdPlace.id);
        } catch {
          // ignore storage errors
        }
      }

      setSuccess("Place created successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setLatitude("");
      setLongitude("");
      setSelectedAmenities([]);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Network error while creating place.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <Link
              to="/places"
              className="text-muted-foreground hover:text-foreground transition-colors mb-3 inline-block"
            >
              ← Back to Places
            </Link>
            <h1 className="text-4xl mb-2">Create a New Place</h1>
            <p className="text-muted-foreground text-lg font-light">
              Describe your property and select the amenities you offer
            </p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-full bg-accent">
            <PlusCircle className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            {success && (
              <p className="text-sm text-emerald-600 text-center">{success}</p>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block mb-2">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Elegant apartment in the city center"
                  className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="description" className="block mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the atmosphere, layout, and what makes this place special..."
                  className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Price & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block mb-2">
                  Price per night
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="latitude" className="block mb-2">
                  Latitude
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="longitude" className="block mb-2">
                  Longitude
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Amenities Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-medium">Amenities</h3>
              </div>
              {amenities.length === 0 && (
                <p className="text-sm text-muted-foreground font-light mb-2">
                  No amenities loaded yet or none configured.
                </p>
              )}
              {amenities.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenities.map((amenity) => {
                    const checked = selectedAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                          checked
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border hover:border-foreground text-muted-foreground"
                        }`}
                      >
                        <span className="truncate">{amenity.name}</span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {checked ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <Link
                to="/places"
                className="flex-1 px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Place"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
