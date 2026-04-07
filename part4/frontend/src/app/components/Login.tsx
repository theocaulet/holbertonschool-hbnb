import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const loginBackgroundUrl =
  "https://images.unsplash.com/photo-1519710884009-22a6918306b0?auto=format&fit=crop&w=1600&q=80";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isSignUp) {
      setError("Sign up n'est pas encore implémenté.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let message = "Login failed";
        try {
          const data = await response.json();
          if (data.msg) message = data.msg;
          else if (data.error) message = data.error;
        } catch {
          message = `Login failed: ${response.statusText}`;
        }
        setError(message);
        return;
      }

      const data = await response.json();
      if (data.access_token) {
        document.cookie = `token=${data.access_token}; path=/`;
      }
      navigate("/");
    } catch (e) {
      setError("Erreur réseau, réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen pt-20">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{
          backgroundImage: `url(${loginBackgroundUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/50 to-primary/70" />
      </div>

      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl mb-2">
                {isSignUp ? "Join Hbnb" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground font-light">
                {isSignUp
                  ? "Create your account to continue"
                  : "Sign in to your account"}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" className="text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                disabled={loading}
              >
                {loading
                  ? isSignUp
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline ml-1"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground mb-4">
                Or continue with
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-white/80">
            By continuing, you agree to Hbnb's{" "}
            <Link to="#" className="underline hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="#" className="underline hover:text-white">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
