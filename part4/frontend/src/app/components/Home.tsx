import { Link } from "react-router";
import { Search, MapPin, Calendar } from "lucide-react";

// Image de fond de la page principale : "363-JqtU-rodez.png" dans le dossier public
const heroBackgroundUrl = "/363-JqtU-rodez.png";

export function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section with Background */}
      <div className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url(${heroBackgroundUrl})`,
            // Place l'image au bas de l'écran pour bien voir l'église
            backgroundPosition: "center bottom",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-6 pt-20">
          <div className="text-center max-w-4xl">
            <h1 className="text-6xl md:text-7xl lg:text-8xl text-white mb-6 tracking-tight">
              <span className="font-light">Discover</span>
              <br />
              <span className="font-medium">Extraordinary Stays</span>
            </h1>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-light">
              Experience curated accommodations that blend timeless elegance with modern comfort
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-full shadow-2xl p-2 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center gap-3 px-6 py-3 border-r border-border">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Where to?"
                    className="flex-1 outline-none bg-transparent"
                  />
                </div>
                <div className="flex-1 flex items-center gap-3 px-6 py-3 border-r border-border">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Check in - Check out"
                    className="flex-1 outline-none bg-transparent"
                  />
                </div>
                <Link
                  to="/places"
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-full flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-4">Curated Locations</h3>
              <p className="text-muted-foreground font-light">
                Handpicked properties in the world's most sought-after destinations
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="mb-4">Refined Experience</h3>
              <p className="text-muted-foreground font-light">
                Each stay is designed with meticulous attention to detail and sophistication
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mb-4">Trusted & Secure</h3>
              <p className="text-muted-foreground font-light">
                Book with confidence knowing every property is verified and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
