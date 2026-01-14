import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, MapPin, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/context/FavoritesContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SubmitResourceForm from "@/components/SubmitResourceForm";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { count } = useFavorites();

  const navLinks = [
    { path: "/", label: t('nav.home') },
    { path: "/resources", label: t('nav.findResources') },
    { path: "/favorites", label: "Saved", icon: Heart, badge: count },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
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
                  data-testid={`nav-${link.path === '/' ? 'home' : link.path.slice(1)}`}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive(link.path)
                      ? "text-[#0284C7] bg-blue-50"
                      : "text-slate-600 hover:text-[#1B3B5A] hover:bg-slate-50"
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                  {link.badge > 0 && (
                    <span className="bg-[#0284C7] text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setSubmitOpen(true)}
                className="text-slate-600 hover:text-[#1B3B5A]"
                data-testid="submit-resource-nav-btn"
              >
                <Plus className="w-4 h-4 mr-1" />
                Submit Resource
              </Button>
              <LanguageSwitcher />
              <Link to="/resources">
                <Button 
                  data-testid="get-help-btn"
                  className="bg-[#0284C7] hover:bg-[#0369a1] text-white font-medium px-5 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-md"
                >
                  {t('nav.getHelpNow')}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <Link to="/favorites" className="relative p-2">
                <Heart className="w-5 h-5 text-slate-600" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0284C7] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
              <LanguageSwitcher />
              <button
                className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
                onClick={() => setIsOpen(!isOpen)}
                data-testid="mobile-menu-btn"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
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
                    className={`px-4 py-3 rounded-md text-base font-medium transition-colors flex items-center gap-2 ${
                      isActive(link.path)
                        ? "text-[#0284C7] bg-blue-50"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    {link.label}
                    {link.badge > 0 && (
                      <span className="bg-[#0284C7] text-white text-xs px-2 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
                <button
                  onClick={() => { setSubmitOpen(true); setIsOpen(false); }}
                  className="px-4 py-3 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Submit Resource
                </button>
                <Link to="/resources" onClick={() => setIsOpen(false)}>
                  <Button className="w-full mt-2 bg-[#0284C7] hover:bg-[#0369a1] text-white font-medium">
                    {t('nav.getHelpNow')}
                  </Button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <SubmitResourceForm open={submitOpen} onOpenChange={setSubmitOpen} />
    </>
  );
};

export default Navbar;
