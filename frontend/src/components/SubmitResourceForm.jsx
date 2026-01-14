import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = [
  { id: "housing", name: "Housing & Shelter" },
  { id: "legal", name: "Legal Aid" },
  { id: "employment", name: "Employment Services" },
  { id: "healthcare", name: "Healthcare & Mental Health" },
  { id: "education", name: "Education & Training" },
  { id: "food", name: "Food Assistance" },
];

const mnCounties = [
  "Hennepin", "Ramsey", "Dakota", "Anoka", "Washington", "Scott", "Carver",
  "Olmsted", "Stearns", "St. Louis", "Wright", "Sherburne", "Blue Earth",
  "Rice", "Winona", "Crow Wing", "Otter Tail", "Clay", "Beltrami", "Other"
];

const SubmitResourceForm = ({ open, onOpenChange }) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    address: "",
    city: "",
    county: "",
    phone: "",
    website: "",
    services: "",
    submitterEmail: ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/submissions`, formData);
      setSubmitted(true);
      toast.success("Resource submitted for review!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      address: "",
      city: "",
      county: "",
      phone: "",
      website: "",
      services: "",
      submitterEmail: ""
    });
    setSubmitted(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Thank You!</h3>
            <p className="text-slate-600 mb-6">
              Your resource submission has been received. We'll review it and add it to our directory if it meets our criteria.
            </p>
            <Button onClick={handleClose} className="bg-[#0284C7] hover:bg-[#0369a1]">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#0F172A]">
            Submit a Resource
          </DialogTitle>
          <DialogDescription>
            Know of a resource that should be in our directory? Submit it for review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Community Support Center"
              required
              data-testid="submit-resource-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(v) => handleChange("category", v)} required>
              <SelectTrigger data-testid="submit-resource-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Briefly describe the services offered..."
              rows={3}
              required
              data-testid="submit-resource-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="e.g., Minneapolis"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County *</Label>
              <Select value={formData.county} onValueChange={(v) => handleChange("county", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {mnCounties.map((county) => (
                    <SelectItem key={county} value={county}>{county}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="e.g., 123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(xxx) xxx-xxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Services Offered</Label>
            <Input
              id="services"
              value={formData.services}
              onChange={(e) => handleChange("services", e.target.value)}
              placeholder="e.g., Case management, Job training (comma separated)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submitterEmail">Your Email (optional)</Label>
            <Input
              id="submitterEmail"
              type="email"
              value={formData.submitterEmail}
              onChange={(e) => handleChange("submitterEmail", e.target.value)}
              placeholder="For follow-up questions only"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-[#0284C7] hover:bg-[#0369a1]"
              data-testid="submit-resource-btn"
            >
              {loading ? "Submitting..." : "Submit Resource"}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitResourceForm;
