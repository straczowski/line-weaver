import { Link } from "react-router-dom"

export const Header = () => {
  return (
    <header className="border-b border-surface px-4 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="font-mono text-xl font-bold tracking-wider text-accent">
          LINE WEAVER
        </Link>
        <nav className="flex gap-4">
          <a href="https://github.com/straczowski/line-weaver" className="text-text-muted transition-colors hover:text-text">
            GitHub
          </a>
          <Link to="/tutorial" className="text-text-muted transition-colors hover:text-text">
            Tutorial
          </Link>
        </nav>
      </div>
    </header>
  )
}

