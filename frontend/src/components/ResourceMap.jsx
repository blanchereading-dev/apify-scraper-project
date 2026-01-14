import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Home as HomeIcon, 
  Scale, 
  Briefcase, 
  Heart, 
  GraduationCap, 
  Utensils, 
  Car,
  MapPin
} from "lucide-react";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons by category
const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
        ">
          ●
        </div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

const categoryColors = {
  housing: "#1e40af",
  legal: "#92400e",
  employment: "#065f46",
  healthcare: "#9d174d",
  education: "#3730a3",
  food: "#9a3412",
  transportation: "#6b21a8",
};

const categoryNames = {
  housing: "Housing & Shelter",
  legal: "Legal Aid",
  employment: "Employment Services",
  healthcare: "Healthcare & Mental Health",
  education: "Education & Training",
  food: "Food Assistance",
  transportation: "Transportation",
};

// Component to fit map bounds to markers
const FitBounds = ({ resources }) => {
  const map = useMap();

  useEffect(() => {
    if (resources.length > 0) {
      const bounds = L.latLngBounds(
        resources.map((r) => [r.latitude, r.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [resources, map]);

  return null;
};

const ResourceMap = ({ resources, onMarkerClick }) => {
  // Center on Minneapolis/St. Paul area
  const center = [44.9778, -93.2650];

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
      data-testid="resource-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <FitBounds resources={resources} />
      
      {resources.map((resource) => (
        <Marker
          key={resource.id}
          position={[resource.latitude, resource.longitude]}
          icon={createCustomIcon(categoryColors[resource.category] || "#1B3B5A")}
          eventHandlers={{
            click: () => onMarkerClick && onMarkerClick(resource),
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <span 
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: `${categoryColors[resource.category]}20`,
                  color: categoryColors[resource.category]
                }}
              >
                {categoryNames[resource.category]}
              </span>
              <h3 className="font-bold text-[#0F172A] mt-2 mb-1">{resource.name}</h3>
              <p className="text-slate-600 text-sm mb-2 line-clamp-2">{resource.description}</p>
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <MapPin className="w-3 h-3" />
                <span>{resource.city}, {resource.state}</span>
              </div>
              {resource.phone && (
                <a 
                  href={`tel:${resource.phone}`}
                  className="mt-2 inline-block text-[#0284C7] text-sm font-medium hover:underline"
                >
                  {resource.phone}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ResourceMap;
