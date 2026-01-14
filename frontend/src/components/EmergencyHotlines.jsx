import { Phone, AlertTriangle } from "lucide-react";

const hotlines = [
  { name: "Suicide Prevention", number: "988" },
  { name: "MN Crisis Line", number: "1-866-379-6363" },
  { name: "211 Resources", number: "211" },
  { name: "Domestic Violence", number: "1-800-799-7233" },
  { name: "SAMHSA Helpline", number: "1-800-662-4357" },
];

const EmergencyHotlines = () => {
  return (
    <section className="py-8 bg-slate-800" data-testid="emergency-hotlines">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Crisis Hotlines</h3>
              <p className="text-slate-400 text-xs">Free, confidential, 24/7</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {hotlines.map((hotline, index) => (
              <a 
                key={index}
                href={`tel:${hotline.number.replace(/-/g, '')}`}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
                data-testid={`hotline-${index}`}
              >
                <Phone className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0284C7]" />
                <span className="text-xs text-slate-400">{hotline.name}:</span>
                <span className="text-sm font-medium">{hotline.number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencyHotlines;
