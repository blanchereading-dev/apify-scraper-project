import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Home as HomeIcon, 
  Scale, 
  Briefcase, 
  Heart, 
  GraduationCap, 
  Utensils,
  ArrowRight,
  Phone,
  MapPin,
  Users,
  Search,
  HelpCircle,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EmergencyHotlines from "@/components/EmergencyHotlines";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const iconMap = {
  Home: HomeIcon,
  Scale: Scale,
  Briefcase: Briefcase,
  Heart: Heart,
  GraduationCap: GraduationCap,
  Utensils: Utensils,
};

const categoryColors = {
  housing: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  legal: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  employment: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  healthcare: "bg-pink-100 text-pink-700 hover:bg-pink-200",
  education: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  food: "bg-orange-100 text-orange-700 hover:bg-orange-600",
};

const Home = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [resourceCount, setResourceCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.post(`${API}/seed`);
        
        const [catRes, resRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/resources`)
        ]);
        setCategories(catRes.data.filter(c => c.id !== 'transportation'));
        setResourceCount(resRes.data.length);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };
    fetchData();
  }, []);

  const getCategoryName = (categoryId) => {
    const names = {
      housing: t('categories.housing'),
      legal: t('categories.legal'),
      employment: t('categories.employment'),
      healthcare: t('categories.healthcare'),
      education: t('categories.education'),
      food: t('categories.food'),
    };
    return names[categoryId] || categoryId;
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="bg-[#0e3d69] py-10 sm:py-12 border-b-4 border-[#7cafde]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#fafdff] rounded flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#0e3d69]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#fafdff] tracking-tight">
                ReEntry Connect <span className="text-[#7cafde]">MN</span>
              </h1>
            </div>
            
            <p className="text-[#fafdff]/90 text-base mb-6 leading-relaxed max-w-2xl">
              A community resource directory connecting individuals returning from incarceration with housing, employment, legal aid, healthcare, and essential services across Minnesota.
            </p>
            
            <Link to="/resources">
              <Button 
                data-testid="hero-find-resources-btn"
                size="lg"
                className="bg-white hover:bg-gray-100 text-[#0e3d69] font-bold px-10 py-6 text-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-white hover:border-[#7cafde]"
              >
                Find Resources
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-4 bg-[#0e3d69]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
            <div className="flex items-center gap-2 text-white/90">
              <Search className="w-4 h-4 text-[#7cafde]" />
              <span className="text-sm">76 resources</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4 text-[#7cafde]" />
              <span className="text-sm">Statewide coverage</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Heart className="w-4 h-4 text-[#7cafde]" />
              <span className="text-sm">Save favorites</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <MessageCircle className="w-4 h-4 text-[#7cafde]" />
              <span className="text-sm">24/7 AI assistant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[#e8f2fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
              Find the Help You Need
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Browse resources by category to find services that match your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category, index) => {
              const IconComponent = iconMap[category.icon] || HomeIcon;
              return (
                <Link 
                  key={category.id} 
                  to={`/resources?category=${category.id}`}
                  data-testid={`category-${category.id}`}
                  className={`animate-fade-in stagger-${Math.min(index + 1, 5)}`}
                  style={{ opacity: 0, animationFillMode: 'forwards' }}
                >
                  <Card className="resource-card border border-slate-200 hover:border-[#0284C7] cursor-pointer h-full bg-white">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${categoryColors[category.id]}`}>
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <h3 className="font-semibold text-[#0F172A] text-sm sm:text-base">
                        {getCategoryName(category.id)}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link to="/resources">
              <Button 
                data-testid="view-all-resources-btn"
                variant="outline"
                size="lg"
                className="border-[#1B3B5A] text-[#1B3B5A] hover:bg-[#1B3B5A] hover:text-white font-medium px-8"
              >
                View All Resources
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Banner */}
      <section className="bg-[#e8f2fa] border-y border-[#7cafde]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-10 py-8">
            <HelpCircle className="w-7 h-7 text-[#0e3d69]" />
            <p className="text-[#0e3d69] text-lg">
              Questions about <span className="font-semibold">IDs</span>, <span className="font-semibold">voting rights</span>, <span className="font-semibold">expungement</span>, or <span className="font-semibold">benefits</span>?
            </p>
            <Link to="/how-to" className="text-[#0e3d69] font-bold text-lg hover:underline flex items-center gap-2">
              Common Questions <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Hotlines */}
      <EmergencyHotlines />

      {/* Footer */}
      <footer className="bg-[#0F172A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#b8d4ed] rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#0e3d69]" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">ReEntry Connect</span>
                <span className="text-[#b8d4ed] font-semibold ml-1">MN</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-slate-400 text-sm">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/resources" className="hover:text-white transition-colors">Find Resources</Link>
              <Link to="/how-to" className="hover:text-white transition-colors">Common Questions</Link>
              <Link to="/feedback" className="hover:text-white transition-colors">Feedback</Link>
            </div>
            
            <p className="text-slate-500 text-sm">
              2025 ReEntry Connect MN
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
