import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DetalleVideojuego } from "./pages/DetalleVideojuego";
import { FormularioPartida } from "./pages/FormularioPartida";
import { FormularioVideojuego } from "./pages/FormularioVideojuego";
import { ListaPartidas } from "./pages/ListaPartidas";
import { ListaVideojuegos } from "./pages/ListaVideojuegos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListaVideojuegos />} />
        <Route path="/videojuegos/nuevo" element={<FormularioVideojuego />} />
        <Route path="/videojuegos/:id" element={<DetalleVideojuego />} />
        <Route path="/videojuegos/:id/editar" element={<FormularioVideojuego />} />
        <Route path="/partidas" element={<ListaPartidas />} />
        <Route path="/partidas/nueva" element={<FormularioPartida />} />
      </Routes>
    </BrowserRouter>
  );
}
