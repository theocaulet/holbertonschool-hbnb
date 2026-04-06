import { Link, useLocation, useNavigate } from "react-router";
import { User, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

// logo.png est placé dans le dossier public de Vite, accessible à la racine
const logoUrl = "/logo.png";
const API_BASE_URL = "/api/v1";

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
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
    // Selon la configuration JWT, l'identité peut être stockée sous plusieurs clés
    return (
      decoded.sub ||
      decoded.identity ||
      decoded.user_id ||
      null
    );
  } catch {
    return null;
  }
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const currentToken = getTokenFromCookie();
    setToken(currentToken);

    const userId = getUserIdFromToken(currentToken);
    if (!userId) {
      setUser(null);
      return;
    }

    async function loadUser() {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!response.ok) return;
        const data: UserProfile = await response.json();
        setUser(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
      } catch {
        // ignore errors, header reste minimal
      }
    }

    loadUser();
  }, [location.pathname]);

  function handleLogout() {
    if (typeof document !== "undefined") {
      document.cookie = "token=; path=/; max-age=0";
    }
    setToken(null);
    setUser(null);
    navigate("/login");
  }

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);

    if (!token || !user) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
        }),
      });

      if (!response.ok) {
        let message = "Unable to update profile.";
        try {
          const data = await response.json();
          if (data.error) message = data.error;
        } catch {
          // ignore
        }
        setSaveError(message);
        return;
      }

      const updated: UserProfile = await response.json();
      setUser(updated);
      setFirstName(updated.first_name || "");
      setLastName(updated.last_name || "");
      setShowProfileModal(false);
    } catch {
      setSaveError("Network error while updating profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logoUrl}
                alt="HBnB logo"
                className="h-8 w-auto object-contain"
              />
            </Link>

            <nav className="flex items-center gap-8">
              <Link
                to="/places"
                className={`flex items-center gap-2 transition-colors ${
                  location.pathname === "/places"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Places</span>
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-colors ${
                    location.pathname === "/login"
                      ? "border-primary text-primary"
                      : "border-border text-foreground hover:border-foreground"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
              {user && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-foreground transition-colors text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[140px] truncate">
                      {user.first_name} {user.last_name}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {showProfileModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl mb-1">Edit Profile</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Update your first and last name. Email and password remain unchanged.
            </p>

            <form className="space-y-4" onSubmit={handleSaveProfile}>
              {saveError && (
                <p className="text-sm text-red-500">{saveError}</p>
              )}

              <div>
                <label htmlFor="firstName" className="block mb-1 text-sm">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow text-sm"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block mb-1 text-sm">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow text-sm"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 text-sm"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
