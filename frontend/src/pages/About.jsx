import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  MapPin, 
  Heart, 
  Users, 
  Shield,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Heart,
      title: t('about.compassion'),
      description: t('about.compassionDesc')
    },
    {
      icon: Shield,
      title: t('about.dignity'),
      description: t('about.dignityDesc')
    },
    {
      icon: Users,
      title: t('about.community'),
      description: t('about.communityDesc')
    }
  ];

  const features = [
    t('about.feature1'),
    t('about.feature2'),
    t('about.feature3'),
    t('about.feature4'),
    t('about.feature5'),
    t('about.feature6')
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="about-page">
      {/* Hero Section */}
      <section className="bg-[#1B3B5A] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#0284C7] font-semibold text-sm uppercase tracking-wider">
                {t('about.missionTitle')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-2 mb-6">
                {t('about.missionSubtitle')}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {t('about.missionP1')}
              </p>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {t('about.missionP2')}
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                {t('about.missionP3')}
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1739757646223-aae94c6ca541?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Community support"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-[#0284C7]/10 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-[#F3F4F6] noise-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="text-[#0284C7] font-semibold text-sm uppercase tracking-wider">
              {t('about.valuesTitle')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-2">
              {t('about.valuesSubtitle')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#0284C7]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-[#0284C7]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1627508599202-06768d0615e4?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Minnesota landscape"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-[#0284C7] font-semibold text-sm uppercase tracking-wider">
                {t('about.featuresTitle')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-2 mb-6">
                {t('about.featuresSubtitle')}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {t('about.featuresDesc')}
              </p>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-[#059669] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1B3B5A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-[#0284C7] rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {t('about.ctaDesc')}
          </p>
          <Link to="/resources">
            <Button 
              data-testid="about-cta-btn"
              size="lg"
              className="bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold px-10 py-6 text-lg transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl"
            >
              {t('about.browseResources')}
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
