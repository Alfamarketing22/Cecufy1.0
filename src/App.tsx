import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Buscar } from "./pages/Buscar";
import { SongDetail } from "./pages/SongDetail";
import { Songbooks } from "./pages/Songbooks";
import { SongbookDetail } from "./pages/SongbookDetail";
import { SongbookPrint } from "./pages/SongbookPrint";
import { Admin } from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/songbooks/:id/print" element={<SongbookPrint />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/canciones/:id" element={<SongDetail />} />
          <Route path="/songbooks" element={<Songbooks />} />
          <Route path="/songbooks/:id" element={<SongbookDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
