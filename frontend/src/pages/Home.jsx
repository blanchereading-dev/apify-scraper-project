import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Home as HomeIcon, 
  Scale, 
  Briefcase, 
  Heart, 
  GraduationCap, 
  Utensils, 
  Car,
  ArrowRight,
  Phone,
  MapPin,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Car: Car,
};

const categoryColors = {
  housing: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  legal: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  employment: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  healthcare: "bg-pink-100 text-pink-700 hover:bg-pink-200",
  education: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  food: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  transportation: "bg-purple-100 text-purple-700 hover:bg-purple-200",
};

const Home = () => {
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
        setCategories(catRes.data);
        setResourceCount(resRes.data.length);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1726587678973-dc942016dc37?crop=entropy&cs=srgb&fm=jpg&q=85')"
          }}
        />
        <div className="absolute inset-0 hero-overlay" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 animate-fade-in">
              Supporting Minnesota's Reentry Community
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
              Your Path to a 
              <span className="text-[#7dd3fc]"> Fresh Start</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl animate-slide-up stagger-1">
              ReEntry Connect MN helps individuals returning from incarceration find 
              housing, employment, legal aid, and other essential services across Minnesota.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up stagger-2">
              <Link to="/resources">
                <Button 
                  data-testid="hero-find-resources-btn"
                  size="lg"
                  className="bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold px-8 py-6 text-lg transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl w-full sm:w-auto"
                >
                  Find Resources
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  data-testid="hero-learn-more-btn"
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg backdrop-blur-sm w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#1B3B5A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center" data-testid="stat-resources">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{resourceCount}+</div>
              <div className="text-white/70 text-sm sm:text-base">Resources Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">7</div>
              <div className="text-white/70 text-sm sm:text-base">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">24/7</div>
              <div className="text-white/70 text-sm sm:text-base">AI Assistant</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">Free</div>
              <div className="text-white/70 text-sm sm:text-base">Always</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-[#F3F4F6] noise-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
              Find the Help You Need
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Browse resources by category to find services that match your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                        {category.name}
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

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Getting help is simple. Here's how to find the resources you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="step-1">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <MapPin className="w-8 h-8 text-[#0284C7]" />
              </div>
              <h3 className="font-bold text-xl text-[#0F172A] mb-3">1. Search</h3>
              <p className="text-slate-600">
                Search by category, location, or keyword to find resources near you
              </p>
            </div>

            <div className="text-center" data-testid="step-2">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Users className="w-8 h-8 text-[#0284C7]" />
              </div>
              <h3 className="font-bold text-xl text-[#0F172A] mb-3">2. Connect</h3>
              <p className="text-slate-600">
                View details, hours, and contact information for each resource
              </p>
            </div>

            <div className="text-center" data-testid="step-3">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Phone className="w-8 h-8 text-[#0284C7]" />
              </div>
              <h3 className="font-bold text-xl text-[#0F172A] mb-3">3. Get Help</h3>
              <p className="text-slate-600">
                Reach out directly or use our AI assistant for guidance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#1B3B5A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Our AI assistant is available 24/7 to help you find the right resources. 
            Click the chat icon in the corner to start a conversation.
          </p>
          <Link to="/resources">
            <Button 
              data-testid="cta-browse-btn"
              size="lg"
              className="bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold px-10 py-6 text-lg transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl"
            >
              Browse Resources Now
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
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/resources" className="hover:text-white transition-colors">Resources</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
            </div>
            
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} ReEntry Connect MN
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
