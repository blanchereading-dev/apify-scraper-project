import { Phone, HeartHandshake } from "lucide-react";

const hotlines = [
  { name: "Suicide Prevention", number: "988" },
  { name: "MN Crisis Line", number: "1-866-379-6363" },
  { name: "211 Resources", number: "211" },
  { name: "Domestic Violence", number: "1-800-799-7233" },
  { name: "SAMHSA Helpline", number: "1-800-662-4357" },
];

const EmergencyHotlines = () => {
  return (
    <section className="py-6 bg-slate-100 border-t border-slate-200" data-testid="emergency-hotlines">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#0284C7]" />
            <h3 className="text-slate-700 font-semibold text-sm">Crisis Hotlines</h3>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {hotlines.map((hotline, index) => (
              <a 
                key={index}
                href={`tel:${hotline.number.replace(/-/g, '')}`}
                className="flex items-center gap-2 text-slate-600 hover:text-[#0284C7] transition-colors group"
                data-testid={`hotline-${index}`}
              >
                <Phone className="w-3 h-3 text-slate-400 group-hover:text-[#0284C7]" />
                <span className="text-xs text-slate-500">{hotline.name}:</span>
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
