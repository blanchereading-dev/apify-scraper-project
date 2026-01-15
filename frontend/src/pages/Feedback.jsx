import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Send, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Feedback = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    message: "",
    email: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.type || !formData.message) {
      toast.error("Please select a feedback type and enter your message");
      return;
    }
    // In a real app, this would send to the backend
    setSubmitted(true);
    toast.success("Thank you for your feedback!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] py-12" data-testid="feedback-page">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Thank You!</h2>
              <p className="text-slate-600 mb-8">
                Your feedback helps us improve ReEntry Connect MN for everyone.
              </p>
              <Link to="/">
                <Button className="bg-[#0284C7] hover:bg-[#0369a1]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]" data-testid="feedback-page">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#0284C7] rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Share Your Feedback</h1>
          </div>
          <p className="text-slate-600">
            Help us improve ReEntry Connect MN. Your input matters.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-[#0F172A]">We'd love to hear from you</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">What type of feedback do you have?</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger id="type" data-testid="feedback-type-select">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">Suggestion for improvement</SelectItem>
                    <SelectItem value="resource">Report a resource issue</SelectItem>
                    <SelectItem value="bug">Report a website problem</SelectItem>
                    <SelectItem value="new-resource">Suggest a new resource</SelectItem>
                    <SelectItem value="general">General feedback</SelectItem>
                    <SelectItem value="praise">Something we did well</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your feedback</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us what's on your mind..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="min-h-[150px] resize-none"
                  data-testid="feedback-message"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  data-testid="feedback-email"
                />
                <p className="text-xs text-slate-500">
                  Only if you'd like us to follow up with you
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#0284C7] hover:bg-[#0369a1]"
                data-testid="feedback-submit-btn"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Feedback
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          Your feedback is anonymous unless you provide your email.
        </p>
      </div>
    </div>
  );
};

export default Feedback;
