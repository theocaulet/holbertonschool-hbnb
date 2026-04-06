import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { MapPin, Star, Users, Home as HomeIcon } from "lucide-react";

const API_BASE_URL = "/api/v1";

type Place = {
  id: string;
  title: string;
  description?: string;
  price: number;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  owner_id?: string;
};

type Review = {
  id: string;
  text: string;
  rating: number;
  user_id: string;
};

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

export function PlaceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [editPrice, setEditPrice] = useState<string>("");
  const [savingPlace, setSavingPlace] = useState(false);
  const [savePlaceError, setSavePlaceError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const currentToken = getTokenFromCookie();
    setToken(currentToken);
     const userId = getUserIdFromToken(currentToken);
     setCurrentUserId(userId);

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {};
        if (currentToken) {
          headers["Authorization"] = `Bearer ${currentToken}`;
        }

        const [placeRes, reviewsRes, amenitiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/places/${id}`, { headers }),
          fetch(`${API_BASE_URL}/reviews/places/${id}`, { headers }),
          fetch(`${API_BASE_URL}/amenities/`, { headers }),
        ]);

        if (!placeRes.ok) {
          throw new Error("Unable to load place details");
        }

        const placeData: Place = await placeRes.json();

        let reviewsData: Review[] = [];
        if (reviewsRes.ok) {
          reviewsData = await reviewsRes.json();
        }
        let amenitiesData: Amenity[] = [];
        if (amenitiesRes.ok) {
          amenitiesData = await amenitiesRes.json();
        }

        setPlace(placeData);
        setReviews(reviewsData);
        setAllAmenities(amenitiesData);
        setSelectedAmenities(
          Array.isArray(placeData.amenities) ? placeData.amenities : []
        );
        setEditPrice(
          typeof placeData.price === "number" ? String(placeData.price) : ""
        );
        setIsOwner(!!userId && placeData.owner_id === userId);
      } catch (e) {
        setError("Unable to load place information.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;

    const currentToken = getTokenFromCookie();
    if (!currentToken) {
      navigate("/login");
      return;
    }

    if (!reviewText.trim() || !rating) {
      setSubmitError("Please provide both a rating and a review.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          text: reviewText.trim(),
          rating,
          place_id: id,
        }),
      });

      if (!response.ok) {
        let message = "Unable to submit review.";
        try {
          const data = await response.json();
          if (data.error) message = data.error;
        } catch {
          // ignore
        }
        setSubmitError(message);
        return;
      }

      // Recharger les reviews après soumission
      const reviewsRes = await fetch(`${API_BASE_URL}/reviews/places/${id}`);
      if (reviewsRes.ok) {
        const reviewsData: Review[] = await reviewsRes.json();
        setReviews(reviewsData);
      }

      setReviewText("");
      setRating(0);
    } catch {
      setSubmitError("Network error while submitting review.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleAmenity(idAmenity: string) {
    setSelectedAmenities((prev) =>
      prev.includes(idAmenity)
        ? prev.filter((a) => a !== idAmenity)
        : [...prev, idAmenity]
    );
  }

  async function handleSavePlace() {
    if (!id || !place) return;

    const currentToken = getTokenFromCookie();
    if (!currentToken) {
      navigate("/login");
      return;
    }

    const newPrice = parseFloat(editPrice);
    if (Number.isNaN(newPrice) || newPrice < 0) {
      setSavePlaceError("Please enter a valid price.");
      return;
    }

    setSavingPlace(true);
    setSavePlaceError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/places/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          price: newPrice,
          amenities: selectedAmenities,
        }),
      });

      if (!response.ok) {
        let message = "Unable to update place.";
        try {
          const data = await response.json();
          if (data.error) message = data.error;
        } catch {
          // ignore
        }
        setSavePlaceError(message);
        return;
      }

      const updated: Place = await response.json();
      setPlace(updated);
      setEditPrice(String(updated.price));
      setSelectedAmenities(
        Array.isArray(updated.amenities) ? updated.amenities : []
      );
    } catch {
      setSavePlaceError("Network error while updating place.");
    } finally {
      setSavingPlace(false);
    }
  }

  async function handleDeletePlace() {
    if (!id || !place) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this place? This action cannot be undone."
    );
    if (!confirmDelete) return;

    const currentToken = getTokenFromCookie();
    if (!currentToken) {
      navigate("/login");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/places/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        let message = "Unable to delete place.";
        try {
          const data = await response.json();
          if (data.error) message = data.error;
        } catch {
          // ignore
        }
        setDeleteError(message);
        return;
      }

      navigate("/places");
    } catch {
      setDeleteError("Network error while deleting place.");
    } finally {
      setDeleting(false);
    }
  }

  if (!id) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-muted-foreground">Invalid place identifier.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 lg:grid-cols-[2fr,1.2fr]">
        {/* Left column: place details + reviews */}
        <div className="space-y-8">
          <div>
            <Link
              to="/places"
              className="text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
            >
              ← Back to Places
            </Link>

            {loading && (
              <p className="text-muted-foreground">Loading place...</p>
            )}
            {error && <p className="text-red-500">{error}</p>}

            {place && !loading && !error && (
              <>
                <h1 className="text-4xl mb-4">{place.title}</h1>
                <p className="text-muted-foreground font-light mb-6">
                  {place.description || "No description provided for this place."}
                </p>

                <div className="grid gap-6 md:grid-cols-2 bg-card rounded-2xl border border-border p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {typeof place.latitude === "number" &&
                        typeof place.longitude === "number"
                          ? `${place.latitude.toFixed(2)}, ${place.longitude.toFixed(2)}`
                          : "Location unavailable"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Up to 4 guests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HomeIcon className="w-4 h-4" />
                        <span>2 bedrooms</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <p className="text-sm text-muted-foreground">Price per night</p>
                    <p className="text-3xl font-semibold">${place.price}</p>
                    <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span>4.9 · 120 reviews</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl mb-3">Amenities</h2>
                  <p className="text-muted-foreground font-light">
                    {Array.isArray(place.amenities) && place.amenities.length
                      ? `${place.amenities.length} amenities available`
                      : "No amenities listed for this place."}
                  </p>

                  {isOwner && (
                    <div className="mt-6 space-y-6">
                      <div>
                        <label htmlFor="editPrice" className="block mb-2 text-sm">
                          Edit price per night
                        </label>
                        <input
                          id="editPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow text-sm"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      </div>

                      <div>
                        <p className="block mb-2 text-sm">Edit amenities</p>
                        {allAmenities.length === 0 && (
                          <p className="text-xs text-muted-foreground font-light mb-2">
                            No amenities loaded yet or none configured.
                          </p>
                        )}
                        {allAmenities.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {allAmenities.map((amenity) => {
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

                      {savePlaceError && (
                        <p className="text-sm text-red-500">{savePlaceError}</p>
                      )}

                      <button
                        type="button"
                        onClick={handleSavePlace}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 text-sm"
                        disabled={savingPlace}
                      >
                        {savingPlace ? "Saving changes..." : "Save changes"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-2xl mb-4">Reviews</h2>
            {reviews.length === 0 && (
              <p className="text-muted-foreground font-light">
                No reviews yet. Be the first to share your experience.
              </p>
            )}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card rounded-2xl border border-border p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span>{review.rating}/5</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Guest ID: {review.user_id}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-light whitespace-pre-line">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {isOwner && (
            <div className="mt-10 border-t border-border pt-6">
              {deleteError && (
                <p className="text-sm text-red-500 mb-3">{deleteError}</p>
              )}
              <button
                type="button"
                onClick={handleDeletePlace}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 text-sm"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete this place"}
              </button>
            </div>
          )}
        </div>

        {/* Right column: add review (only if authenticated) */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-2xl mb-4">Add a Review</h2>

            {!token && (
              <p className="text-sm text-muted-foreground mb-4">
                You need to be logged in to add a review. {""}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-primary hover:underline"
                >
                  Go to Login
                </button>
              </p>
            )}

            {token && (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {submitError && (
                  <p className="text-sm text-red-500">{submitError}</p>
                )}

                <div>
                  <label className="block mb-2 text-sm">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? "fill-primary text-primary"
                              : "fill-none text-border"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="reviewText" className="block mb-2 text-sm">
                    Your Review
                  </label>
                  <textarea
                    id="reviewText"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                    placeholder="Share your thoughts about this place..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
