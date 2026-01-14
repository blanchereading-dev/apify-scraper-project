import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Resources from "@/pages/Resources";
import About from "@/pages/About";
import ChatBot from "@/components/ChatBot";

function App() {
  return (
    <div className="App min-h-screen bg-white">
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <ChatBot />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
