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
    <section className="py-8 bg-[#0e3d69]" data-testid="emergency-hotlines">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-bold text-base">Crisis Hotlines</h3>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {hotlines.map((hotline, index) => (
              <a 
                key={index}
                href={`tel:${hotline.number.replace(/-/g, '')}`}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
                data-testid={`hotline-${index}`}
              >
                <Phone className="w-4 h-4 text-[#7cafde] group-hover:text-white" />
                <span className="text-sm text-white/70">{hotline.name}:</span>
                <span className="text-base font-semibold">{hotline.number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencyHotlines;
