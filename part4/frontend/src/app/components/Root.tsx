import { Outlet } from "react-router";
import { Header } from "./Header";

export function Root() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>Made by Nabil Zinini</span>
          <a
            href="https://github.com/zinininabil-stack"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            About me
          </a>
        </div>
      </footer>
    </div>
  );
}
