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

      <header className="relative z-10 border-b border-white/[0.07] bg-night/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="group flex w-fit items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-signal/20 bg-gradient-to-br from-signal/15 to-earth/20 text-xl shadow-glow transition group-hover:border-signal/50">
              <span aria-hidden="true">🎮</span>
            </span>
            <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">
              Diario Gamer
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="rounded-full px-4 py-2 text-sm font-semibold text-stone-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Videojuegos
            </Link>
            <Link
              to="/partidas"
              className="rounded-full px-4 py-2 text-sm font-semibold text-stone-300 transition hover:bg-white/[0.06] hover:text-white"
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
