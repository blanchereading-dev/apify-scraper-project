import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFavorites } from "@/context/FavoritesContext";
import { 
  Search, 
  Home as HomeIcon, 
  Scale, 
  Briefcase, 
  Heart, 
  GraduationCap, 
  Utensils,
  MapPin,
  Phone,
  Globe,
  Clock,
  Filter,
  List,
  Map as MapIcon,
  X,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import ResourceMap from "@/components/ResourceMap";
import { toast } from "sonner";

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
  housing: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  legal: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  employment: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  healthcare: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
  education: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  food: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
};

// Minnesota counties with major cities mapped
const mnCounties = [
  { name: "All Counties", value: "all" },
  { name: "Hennepin (Minneapolis)", value: "Hennepin" },
  { name: "Ramsey (St. Paul)", value: "Ramsey" },
  { name: "Dakota", value: "Dakota" },
  { name: "Anoka", value: "Anoka" },
  { name: "Washington", value: "Washington" },
  { name: "Scott", value: "Scott" },
  { name: "Carver", value: "Carver" },
  { name: "Olmsted (Rochester)", value: "Olmsted" },
  { name: "Stearns (St. Cloud)", value: "Stearns" },
  { name: "St. Louis (Duluth)", value: "St. Louis" },
  { name: "Wright", value: "Wright" },
  { name: "Sherburne", value: "Sherburne" },
  { name: "Blue Earth (Mankato)", value: "Blue Earth" },
  { name: "Chisago", value: "Chisago" },
];

// City to county mapping for filtering
const cityToCounty = {
  "Minneapolis": "Hennepin",
  "St. Paul": "Ramsey",
  "Rochester": "Olmsted",
  "St. Cloud": "Stearns",
  "Duluth": "St. Louis",
  "Brooklyn Park": "Hennepin",
  "Edina": "Hennepin",
  "Golden Valley": "Hennepin",
  "Roseville": "Ramsey",
  "Center City": "Chisago",
};

const Resources = () => {
  const { t } = useTranslation();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedCounty, setSelectedCounty] = useState(searchParams.get("county") || "all");
  const [viewMode, setViewMode] = useState("list");
  const [selectedResource, setSelectedResource] = useState(null);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resRes, catRes] = await Promise.all([
          axios.get(`${API}/resources`),
          axios.get(`${API}/categories`)
        ]);
        setResources(resRes.data.filter(r => r.category !== 'transportation'));
        setCategories(catRes.data.filter(c => c.id !== 'transportation'));
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    const county = searchParams.get("county");
    if (category) setSelectedCategory(category);
    if (county) setSelectedCounty(county);
  }, [searchParams]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesCategory = !selectedCategory || resource.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // County filter - check city to county mapping
      let matchesCounty = true;
      if (selectedCounty && selectedCounty !== "all") {
        const resourceCounty = cityToCounty[resource.city] || "";
        matchesCounty = resourceCounty === selectedCounty;
      }
      
      return matchesCategory && matchesSearch && matchesCounty;
    });
  }, [resources, selectedCategory, searchQuery, selectedCounty]);

  const handleCategoryClick = (categoryId) => {
    const newCategory = selectedCategory === categoryId ? "" : categoryId;
    setSelectedCategory(newCategory);
    updateSearchParams({ category: newCategory, county: selectedCounty === "all" ? "" : selectedCounty });
  };

  const handleCountyChange = (county) => {
    setSelectedCounty(county);
    updateSearchParams({ category: selectedCategory, county: county === "all" ? "" : county });
  };

  const updateSearchParams = ({ category, county }) => {
    const params = {};
    if (category) params.category = category;
    if (county) params.county = county;
    setSearchParams(params);
  };

  const handleFavoriteToggle = (resource, e) => {
    e.stopPropagation();
    if (isFavorite(resource.id)) {
      removeFavorite(resource.id);
      toast.info("Removed from saved resources");
    } else {
      addFavorite(resource);
      toast.success("Saved to your list!");
    }
  };

  const getCategoryInfo = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: categoryId, icon: "Home" };
  };

  const ResourceCard = ({ resource }) => {
    const categoryInfo = getCategoryInfo(resource.category);
    const IconComponent = iconMap[categoryInfo.icon] || HomeIcon;
    const colors = categoryColors[resource.category] || categoryColors.housing;
    const favorited = isFavorite(resource.id);

    return (
      <Card 
        className="resource-card border border-slate-200 hover:border-[#0284C7] cursor-pointer relative"
        onClick={() => setSelectedResource(resource)}
        data-testid={`resource-card-${resource.id}`}
      >
        <button
          onClick={(e) => handleFavoriteToggle(resource, e)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors z-10 ${
            favorited 
              ? "bg-red-50 text-red-500" 
              : "bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50"
          }`}
          data-testid={`favorite-btn-${resource.id}`}
        >
          <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
        </button>

        <CardHeader className="pb-3 pr-12">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-[#0F172A] mb-2 line-clamp-1">
                {resource.name}
              </CardTitle>
              <Badge className={`${colors.bg} ${colors.text} ${colors.border} font-medium`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {getCategoryName(resource.category)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {resource.description}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 text-slate-500">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{resource.address}, {resource.city}</span>
            </div>
            {resource.phone && (
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{resource.phone}</span>
              </div>
            )}
          </div>

          {resource.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {resource.services.slice(0, 3).map((service, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md"
                >
                  {service}
                </span>
              ))}
              {resource.services.length > 3 && (
                <span className="px-2 py-0.5 text-slate-400 text-xs">
                  +{resource.services.length - 3} more
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ResourceDetail = ({ resource, onClose }) => {
    const categoryInfo = getCategoryInfo(resource.category);
    const IconComponent = iconMap[categoryInfo.icon] || HomeIcon;
    const colors = categoryColors[resource.category] || categoryColors.housing;
    const favorited = isFavorite(resource.id);

    return (
      <div className="h-full flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${colors.bg} ${colors.text} ${colors.border} font-medium`}>
                  <IconComponent className="w-3 h-3 mr-1" />
                  {getCategoryName(resource.category)}
                </Badge>
                {resource.reentry_focused && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium">
                    Reentry-focused
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-xl font-bold text-[#0F172A]">
                {resource.name}
              </SheetTitle>
            </div>
            <button
              onClick={(e) => handleFavoriteToggle(resource, e)}
              className={`p-2 rounded-full transition-colors ${
                favorited 
                  ? "bg-red-50 text-red-500" 
                  : "bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50"
              }`}
            >
              <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
            </button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="py-6 space-y-6">
            {/* What this program offers */}
            <div>
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">What this program offers</h4>
              <p className="text-slate-700 leading-relaxed">
                {resource.description}
              </p>
            </div>

            {/* Good fit if */}
            {resource.good_fit_if && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-2">Good fit if</h4>
                <p className="text-blue-800 text-sm">{resource.good_fit_if}</p>
              </div>
            )}

            {/* Services */}
            {resource.services.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {resource.services.map((service, idx) => (
                    <Badge 
                      key={idx}
                      variant="secondary"
                      className="bg-slate-100 text-slate-700 font-normal"
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Serving Area & Cost */}
            <div className="grid grid-cols-2 gap-4">
              {resource.serving_area && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Serving Area</h4>
                  <p className="text-slate-700 text-sm">{resource.serving_area}</p>
                </div>
              )}
              {resource.cost && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Cost</h4>
                  <p className="text-slate-700 text-sm">{resource.cost}</p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contact</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0F172A] text-sm">Address</p>
                    <p className="text-slate-600 text-sm">
                      {resource.address}<br />
                      {resource.city}, {resource.state} {resource.zip_code}
                    </p>
                  </div>
                </div>

                {resource.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0F172A] text-sm">Phone</p>
                      <a href={`tel:${resource.phone}`} className="text-[#0284C7] hover:underline text-sm">
                        {resource.phone}
                      </a>
                    </div>
                  </div>
                )}

                {resource.website && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0F172A] text-sm">Website</p>
                      <a 
                        href={resource.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#0284C7] hover:underline text-sm break-all"
                      >
                        {resource.website}
                      </a>
                    </div>
                  </div>
                )}

                {resource.hours && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0F172A] text-sm">Hours</p>
                      <p className="text-slate-600 text-sm">{resource.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t mt-auto space-y-2">
          <Button
            onClick={(e) => handleFavoriteToggle(resource, e)}
            variant={favorited ? "outline" : "secondary"}
            className={`w-full ${favorited ? "border-red-200 text-red-600" : ""}`}
          >
            <Heart className={`w-4 h-4 mr-2 ${favorited ? "fill-current" : ""}`} />
            {favorited ? "Remove from Saved" : "Save Resource"}
          </Button>
          {resource.phone && (
            <a href={`tel:${resource.phone}`}>
              <Button 
                className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white"
                data-testid="call-resource-btn"
              >
                <Phone className="w-4 h-4 mr-2" />
                {t('resources.callNow')}
              </Button>
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]" data-testid="resources-page">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">{t('resources.title')}</h1>
          <p className="text-slate-600">
            {t('resources.subtitle')}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder={t('resources.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-[#0284C7] search-input"
                data-testid="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* County Filter */}
            <Select value={selectedCounty} onValueChange={handleCountyChange}>
              <SelectTrigger className="w-full lg:w-[200px] h-11" data-testid="county-filter">
                <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="All Counties" />
              </SelectTrigger>
              <SelectContent>
                {mnCounties.map((county) => (
                  <SelectItem key={county.value} value={county.value}>
                    {county.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-[#1B3B5A] hover:bg-[#1B3B5A]/90" : ""}
                data-testid="view-list-btn"
              >
                <List className="w-4 h-4 mr-1" />
                {t('resources.list')}
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
                className={viewMode === "map" ? "bg-[#1B3B5A] hover:bg-[#1B3B5A]/90" : ""}
                data-testid="view-map-btn"
              >
                <MapIcon className="w-4 h-4 mr-1" />
                {t('resources.map')}
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCategoryClick("")}
              className={`flex-shrink-0 border ${selectedCategory === "" ? "bg-[#1B3B5A] text-white border-[#1B3B5A]" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"}`}
              data-testid="filter-all"
            >
              <Filter className="w-4 h-4 mr-1" />
              {t('resources.all')}
            </Button>
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || HomeIcon;
              const isActive = selectedCategory === category.id;
              const colors = categoryColors[category.id] || categoryColors.housing;
              return (
                <Button
                  key={category.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex-shrink-0 filter-tag border ${isActive ? `${colors.bg} ${colors.text} ${colors.border} font-semibold` : `${colors.bg} ${colors.text} ${colors.border} hover:opacity-80`}`}
                  data-testid={`filter-${category.id}`}
                >
                  <IconComponent className="w-4 h-4 mr-1" />
                  {getCategoryName(category.id)}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Count */}
        <div className="mb-4 text-sm text-slate-600">
          {loading ? (
            <Skeleton className="h-5 w-40" />
          ) : (
            <span data-testid="results-count">
              {filteredResources.length} {filteredResources.length !== 1 ? t('resources.found') : t('resources.foundSingular')}
              {selectedCategory && ` ${t('resources.in')} ${getCategoryName(selectedCategory)}`}
              {selectedCounty && selectedCounty !== "all" && ` • ${selectedCounty} County`}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-slate-200">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === "list" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Sheet key={resource.id}>
                <SheetTrigger asChild>
                  <div>
                    <ResourceCard resource={resource} />
                  </div>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <ResourceDetail resource={resource} />
                </SheetContent>
              </Sheet>
            ))}
            {filteredResources.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{t('resources.noResults')}</h3>
                <p className="text-slate-600">{t('resources.noResultsDesc')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[600px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <ResourceMap 
              resources={filteredResources} 
              onMarkerClick={(resource) => setSelectedResource(resource)}
            />
          </div>
        )}
      </div>

      {/* Resource Detail Sheet for Map View */}
      {selectedResource && viewMode === "map" && (
        <Sheet open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <SheetContent className="w-full sm:max-w-lg">
            <ResourceDetail resource={selectedResource} onClose={() => setSelectedResource(null)} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default Resources;
