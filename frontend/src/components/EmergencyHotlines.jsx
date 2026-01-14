import { useTranslation } from "react-i18next";
import { Phone, AlertTriangle, Heart, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const hotlines = [
  {
    name: "National Suicide Prevention Lifeline",
    number: "988",
    description: "24/7 crisis support for anyone in emotional distress",
    icon: Heart,
    color: "bg-red-100 text-red-600"
  },
  {
    name: "Minnesota Crisis Line",
    number: "1-866-379-6363",
    description: "Mental health crisis support for Minnesotans",
    icon: Phone,
    color: "bg-blue-100 text-blue-600"
  },
  {
    name: "211 Minnesota",
    number: "211",
    description: "Connect to local resources for food, housing, and more",
    icon: Users,
    color: "bg-green-100 text-green-600"
  },
  {
    name: "National Domestic Violence Hotline",
    number: "1-800-799-7233",
    description: "24/7 confidential support for domestic violence",
    icon: Shield,
    color: "bg-purple-100 text-purple-600"
  },
  {
    name: "SAMHSA National Helpline",
    number: "1-800-662-4357",
    description: "Free substance abuse treatment referrals 24/7",
    icon: AlertTriangle,
    color: "bg-amber-100 text-amber-600"
  }
];

const EmergencyHotlines = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-slate-50" data-testid="emergency-hotlines">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <AlertTriangle className="w-4 h-4" />
            Crisis Resources
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
            Emergency Hotlines
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            If you or someone you know is in crisis, these free, confidential resources are available 24/7.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotlines.map((hotline, index) => (
            <Card key={index} className="border border-slate-200 hover:border-slate-300 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${hotline.color}`}>
                    <hotline.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#0F172A] text-sm mb-1">
                      {hotline.name}
                    </h3>
                    <a 
                      href={`tel:${hotline.number.replace(/-/g, '')}`}
                      className="text-[#0284C7] font-bold text-lg hover:underline block mb-1"
                      data-testid={`hotline-${index}`}
                    >
                      {hotline.number}
                    </a>
                    <p className="text-slate-500 text-xs">
                      {hotline.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmergencyHotlines;
