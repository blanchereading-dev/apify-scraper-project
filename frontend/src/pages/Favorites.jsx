import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFavorites } from "@/context/FavoritesContext";
import { 
  Heart, 
  Trash2, 
  MapPin, 
  Phone, 
  Globe,
  ArrowRight,
  BookmarkX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryColors = {
  housing: { bg: "bg-blue-100", text: "text-blue-700" },
  legal: { bg: "bg-amber-100", text: "text-amber-700" },
  employment: { bg: "bg-emerald-100", text: "text-emerald-700" },
  healthcare: { bg: "bg-pink-100", text: "text-pink-700" },
  education: { bg: "bg-indigo-100", text: "text-indigo-700" },
  food: { bg: "bg-orange-100", text: "text-orange-700" },
};

const categoryNames = {
  housing: "Housing & Shelter",
  legal: "Legal Aid",
  employment: "Employment Services",
  healthcare: "Healthcare & Mental Health",
  education: "Education & Training",
  food: "Food Assistance",
};

const Favorites = () => {
  const { t } = useTranslation();
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

  return (
    <div className="min-h-screen bg-[#F3F4F6]" data-testid="favorites-page">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2 flex items-center gap-3">
                <Heart className="w-8 h-8 text-[#0284C7]" />
                Saved Resources
              </h1>
              <p className="text-slate-600">
                {favorites.length} resource{favorites.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            {favorites.length > 0 && (
              <Button 
                variant="outline" 
                onClick={clearFavorites}
                className="text-red-600 border-red-200 hover:bg-red-50"
                data-testid="clear-favorites-btn"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookmarkX className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-2">No saved resources yet</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Browse our resource directory and click the heart icon to save resources for quick access later.
            </p>
            <Link to="/resources">
              <Button className="bg-[#0284C7] hover:bg-[#0369a1]">
                Browse Resources
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((resource) => {
              const colors = categoryColors[resource.category] || categoryColors.housing;
              return (
                <Card key={resource.id} className="border border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-[#0F172A] mb-2">
                          {resource.name}
                        </CardTitle>
                        <Badge className={`${colors.bg} ${colors.text} font-medium`}>
                          {categoryNames[resource.category]}
                        </Badge>
                      </div>
                      <button
                        onClick={() => removeFavorite(resource.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`remove-favorite-${resource.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {resource.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-slate-500">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{resource.city}, MN</span>
                      </div>
                      {resource.phone && (
                        <a href={`tel:${resource.phone}`} className="flex items-center gap-2 text-[#0284C7] hover:underline">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{resource.phone}</span>
                        </a>
                      )}
                      {resource.website && (
                        <a href={resource.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#0284C7] hover:underline">
                          <Globe className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Visit Website</span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
