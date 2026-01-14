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
  Users
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
  food: "bg-orange-100 text-orange-700 hover:bg-orange-200",
};

const Home = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [resourceCount, setResourceCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Seed database first
        await axios.post(`${API}/seed`);
        
        const [catRes, resRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/resources`)
        ]);
        // Filter out transportation category
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
      {/* Hero Section - Clean Community Style */}
      <section className="bg-[#1B3B5A] py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#0284C7] rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                ReEntry Connect MN
              </h1>
            </div>
            
            <p className="text-white/90 text-lg mb-6 leading-relaxed">
              A community resource directory connecting individuals returning from incarceration 
              with housing, employment, legal aid, healthcare, and essential services across Minnesota.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/resources">
                <Button 
                  data-testid="hero-find-resources-btn"
                  className="bg-[#0284C7] hover:bg-[#0369a1] text-white font-medium px-6 transition-all duration-200 w-full sm:w-auto"
                >
                  {t('hero.findResources')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[#F3F4F6] noise-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
              {t('categories.title')}
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              {t('categories.subtitle')}
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
                  <Card className="resource-card border border-slate-200 hover:border-[#0284C7] cursor-pointer h-full">
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
                {t('categories.viewAll')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section - Condensed */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
              {t('howItWorks.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center" data-testid="step-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-[#0284C7]" />
              </div>
              <h3 className="font-semibold text-lg text-[#0F172A] mb-1">{t('howItWorks.step1Title')}</h3>
              <p className="text-slate-600 text-sm">{t('howItWorks.step1Desc')}</p>
            </div>

            <div className="text-center" data-testid="step-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-[#0284C7]" />
              </div>
              <h3 className="font-semibold text-lg text-[#0F172A] mb-1">{t('howItWorks.step2Title')}</h3>
              <p className="text-slate-600 text-sm">{t('howItWorks.step2Desc')}</p>
            </div>

            <div className="text-center" data-testid="step-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-[#0284C7]" />
              </div>
              <h3 className="font-semibold text-lg text-[#0F172A] mb-1">{t('howItWorks.step3Title')}</h3>
              <p className="text-slate-600 text-sm">{t('howItWorks.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Hotlines */}
      <EmergencyHotlines />

      {/* CTA Section */}
      <section className="py-16 bg-[#1B3B5A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <Link to="/resources">
            <Button 
              data-testid="cta-browse-btn"
              size="lg"
              className="bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold px-10 py-6 text-lg transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl"
            >
              {t('cta.browseNow')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#0284C7] rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">ReEntry Connect</span>
                <span className="text-[#7dd3fc] font-semibold ml-1">MN</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-slate-400 text-sm">
              <Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link>
              <Link to="/resources" className="hover:text-white transition-colors">{t('nav.findResources')}</Link>
            </div>
            
            <p className="text-slate-500 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
