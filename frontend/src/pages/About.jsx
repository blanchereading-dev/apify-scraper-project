import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white" data-testid="about-page">
      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-14 h-14 bg-[#0284C7] rounded-xl flex items-center justify-center">
              <MapPin className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-6">
            Our Mission
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed mb-6">
            ReEntry Connect MN exists to bridge the gap between individuals returning 
            from incarceration and the essential resources they need to rebuild their lives.
          </p>
          
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            We believe everyone deserves a second chance. Our platform connects people 
            with housing, employment, legal aid, healthcare, education, and food assistance 
            services across Minnesota—all in one place, free of charge.
          </p>
          
          <p className="text-lg text-slate-600 leading-relaxed mb-10">
            Whether you're preparing for release, recently returned, or supporting someone 
            on their reentry journey, we're here to help you find the resources you need.
          </p>

          <Link to="/resources">
            <Button 
              data-testid="about-cta-btn"
              size="lg"
              className="bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold px-10 py-6 text-lg transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl"
            >
              Find Resources
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] py-12 mt-auto">
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
              <Link to="/about" className="hover:text-white transition-colors">{t('nav.about')}</Link>
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

export default About;
