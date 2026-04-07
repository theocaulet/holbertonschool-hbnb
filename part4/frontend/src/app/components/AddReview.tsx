import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Star, Upload, X } from "lucide-react";

export function AddReview() {
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get("place");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = "/api/v1";

  function getTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
    return null;
  }

  useEffect(() => {
    const token = getTokenFromCookie();
    if (!token) {
      // Non authentifié → redirection vers la page d'accueil (équivalent index.html)
      navigate("/");
    }
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setUploadedImages([...uploadedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!placeId) {
      setError("Missing place identifier.");
      return;
    }

    const token = getTokenFromCookie();
    if (!token) {
      // Si le token a expiré ou n'est plus présent, renvoyer l'utilisateur vers la home
      navigate("/");
      return;
    }

    if (!rating || !reviewText.trim()) {
      setError("Please provide a rating and a review.");
      return;
    }

    setSubmitting(true);
    try {
      setSuccess(null);
      const response = await fetch(`${API_BASE_URL}/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: reviewText.trim(),
          rating,
          place_id: placeId,
        }),
      });

      if (!response.ok) {
        let message = "Unable to submit review.";
        try {
          const data = await response.json();
          if (data.error) message = data.error;
        } catch {
          // ignore JSON parse errors
        }
        setError(message);
        return;
      }
      // Succès : message + reset du formulaire
      setSuccess("Review submitted successfully!");
      setRating(0);
      setReviewText("");
      setUploadedImages([]);
    } catch {
      setError("Network error while submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/places"
            className="text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
          >
            ← Back to Places
          </Link>
          <h1 className="text-4xl mb-3">Share Your Experience</h1>
          <p className="text-muted-foreground text-lg font-light">
            Help others discover exceptional stays
          </p>
        </div>

        {/* Review Form */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <p className="text-sm text-red-500 mb-2 text-center">{error}</p>
            )}
            {success && (
              <p className="text-sm text-emerald-600 mb-2 text-center">{success}</p>
            )}
            {/* Rating */}
            <div>
              <label className="block mb-4">Overall Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? "fill-primary text-primary"
                          : "fill-none text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {rating === 5 && "Exceptional!"}
                  {rating === 4 && "Great experience"}
                  {rating === 3 && "Good"}
                  {rating === 2 && "Fair"}
                  {rating === 1 && "Needs improvement"}
                </p>
              )}
            </div>

            {/* Category Ratings */}
            <div className="space-y-6">
              <h3>Detailed Ratings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Cleanliness", id: "cleanliness" },
                  { label: "Communication", id: "communication" },
                  { label: "Check-in", id: "checkin" },
                  { label: "Accuracy", id: "accuracy" },
                  { label: "Location", id: "location" },
                  { label: "Value", id: "value" },
                ].map((category) => (
                  <div key={category.id}>
                    <label
                      htmlFor={category.id}
                      className="block mb-2 text-sm text-muted-foreground"
                    >
                      {category.label}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-6 h-6 fill-none text-border cursor-pointer hover:text-primary transition-colors"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label htmlFor="title" className="block mb-3">
                Review Title
              </label>
              <input
                type="text"
                id="title"
                placeholder="Sum up your experience in a few words"
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="review" className="block mb-3">
                Your Review
              </label>
              <textarea
                id="review"
                rows={6}
                placeholder="Share your thoughts about the place, host, amenities, and overall experience..."
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-2 font-light">
                Minimum 50 characters
              </p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block mb-3">Add Photos (Optional)</label>
              <div className="space-y-4">
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden group"
                      >
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-foreground transition-colors bg-accent/30">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload photos
                  </p>
                  <p className="text-xs text-muted-foreground font-light">
                    PNG, JPG up to 10MB
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            {/* Guest Information */}
            <div className="space-y-4">
              <h3>About Your Stay</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkIn" className="block mb-2 text-sm">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    id="checkIn"
                    className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="checkOut" className="block mb-2 text-sm">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    id="checkOut"
                    className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-border"
                />
                <span>I would recommend this place to friends and family</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Link
                to="/places"
                className="flex-1 px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>

        {/* Guidelines */}
        <div className="mt-8 p-6 bg-accent/50 rounded-xl border border-border">
          <h4 className="mb-3">Review Guidelines</h4>
          <ul className="space-y-2 text-sm text-muted-foreground font-light">
            <li>• Be honest and constructive in your feedback</li>
            <li>• Focus on your personal experience</li>
            <li>• Avoid inappropriate language or personal attacks</li>
            <li>• Include specific details that could help future guests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
