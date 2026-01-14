import "@/App.css";
import "@/i18n";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { FavoritesProvider } from "@/context/FavoritesContext";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Resources from "@/pages/Resources";
import About from "@/pages/About";
import Favorites from "@/pages/Favorites";
import ChatBot from "@/components/ChatBot";

function App() {
  return (
    <FavoritesProvider>
      <div className="App min-h-screen bg-white">
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <ChatBot />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </div>
    </FavoritesProvider>
  );
}

export default App;
