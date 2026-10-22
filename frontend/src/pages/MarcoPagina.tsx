import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface MarcoPaginaProps {
  children: ReactNode;
}

export function MarcoPagina({ children }: MarcoPaginaProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-48 h-96 w-96 rounded-full bg-signal/[0.045] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-52 top-[42rem] h-[30rem] w-[30rem] rounded-full bg-earth/[0.07] blur-3xl"
      />

      <header className="app-header">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="group flex w-fit items-center gap-3.5">
            <span className="brand-mark">
              <span aria-hidden="true">🎮</span>
            </span>
            <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">
              Diario Gamer
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="site-nav-link"
            >
              Videojuegos
            </Link>
            <Link
              to="/partidas"
              className="site-nav-link"
            >
              Partidas
            </Link>
            <Link to="/videojuegos/nuevo" className="primary-button !rounded-full !px-4 !py-2">
              Añadir videojuego
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-0 mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {children}
      </main>

    </div>
  );
}
