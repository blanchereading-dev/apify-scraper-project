import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/resources", label: "Find Resources" },
    { path: "/about", label: "About" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
            data-testid="logo-link"
          >
            <div className="w-10 h-10 bg-[#1B3B5A] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-[#1B3B5A] text-lg tracking-tight">
                ReEntry Connect
              </span>
              <span className="text-[#0284C7] font-semibold ml-1">MN</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? "text-[#0284C7] bg-blue-50"
                    : "text-slate-600 hover:text-[#1B3B5A] hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link to="/resources">
              <Button 
                data-testid="get-help-btn"
                className="bg-[#0284C7] hover:bg-[#0369a1] text-white font-medium px-5 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-md"
              >
                Get Help Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-[#0284C7] bg-blue-50"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/resources" onClick={() => setIsOpen(false)}>
                <Button className="w-full mt-2 bg-[#0284C7] hover:bg-[#0369a1] text-white font-medium">
                  Get Help Now
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
