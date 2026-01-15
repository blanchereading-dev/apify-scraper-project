import { ExternalLink, FileText, CreditCard, Vote, Briefcase, Home, Heart, Scale, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    icon: CreditCard,
    question: "How do I get a Minnesota ID or drivers license?",
    answer: "Visit any Minnesota DVS office with proof of identity and residency. If you lost documents during incarceration, you may request copies of your birth certificate first.",
    link: "https://dps.mn.gov/divisions/dvs/Pages/dvs-content-detail.aspx?pageID=551",
    linkText: "MN Driver and Vehicle Services"
  },
  {
    icon: Vote,
    question: "Can I vote after incarceration?",
    answer: "In Minnesota, your right to vote is restored once you have completed all parts of your sentence, including probation and parole. You must re-register to vote.",
    link: "https://www.sos.state.mn.us/elections-voting/register-to-vote/",
    linkText: "MN Secretary of State - Voter Registration"
  },
  {
    icon: Scale,
    question: "How do I get my record expunged?",
    answer: "Minnesota law allows certain criminal records to be sealed. Eligibility depends on the offense type and time since completion of sentence. Free legal help is available.",
    link: "https://www.mncourts.gov/Help-Topics/Expungement.aspx",
    linkText: "MN Courts - Expungement Information"
  },
  {
    icon: FileText,
    question: "How do I apply for SNAP or food benefits?",
    answer: "Apply online through MNbenefits or visit your county human services office. Most people leaving incarceration qualify based on income.",
    link: "https://mnbenefits.mn.gov/",
    linkText: "MNbenefits - Apply for Assistance"
  },
  {
    icon: Heart,
    question: "How do I get health insurance?",
    answer: "Minnesota Medical Assistance provides free or low-cost coverage. Apply through MNsure or your county. You can apply immediately after release.",
    link: "https://www.mnsure.org/",
    linkText: "MNsure - Health Insurance Marketplace"
  },
  {
    icon: Briefcase,
    question: "Where can I find job search help?",
    answer: "CareerForce centers offer free services including job listings, resume help, and training programs at locations throughout Minnesota.",
    link: "https://mn.gov/deed/job-seekers/job-search/",
    linkText: "MN DEED - Job Search Resources"
  },
  {
    icon: Home,
    question: "What housing assistance is available?",
    answer: "Contact your county housing authority for Section 8 and public housing. Some programs have policies that consider applicants with criminal histories.",
    link: "https://mn.gov/housing/",
    linkText: "Minnesota Housing Finance Agency"
  },
  {
    icon: FileText,
    question: "How do I get copies of my vital records?",
    answer: "Request birth certificates, marriage certificates, and other documents from the Minnesota Department of Health. These are often needed for IDs and benefits.",
    link: "https://www.health.state.mn.us/people/vitalrecords/index.html",
    linkText: "MN Dept of Health - Vital Records"
  }
];

const HowTo = () => {
  return (
    <div className="min-h-screen bg-[#fafdff]" data-testid="howto-page">
      {/* Header */}
      <div className="bg-[#0e3d69] border-b-4 border-[#7cafde]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-6 h-6 text-[#7cafde]" />
            <h1 className="text-2xl font-bold text-[#fafdff]">Frequently Asked Questions</h1>
          </div>
          <p className="text-[#fafdff]/80 max-w-2xl">
            Common questions answered with links to official Minnesota government resources.
          </p>
        </div>
      </div>

      {/* FAQ Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-5">
          {faqs.map((faq, index) => (
            <Card key={index} className="border border-slate-200 bg-white hover:border-[#7cafde] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0e3d69] rounded-lg flex items-center justify-center flex-shrink-0">
                    <faq.icon className="w-5 h-5 text-[#7cafde]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0e3d69] mb-2">{faq.question}</h3>
                    <p className="text-slate-600 text-sm mb-3 leading-relaxed">{faq.answer}</p>
                    <a 
                      href={faq.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0e3d69] hover:text-[#7cafde] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {faq.linkText}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="mt-10 p-6 bg-[#e8f1f8] rounded-lg border border-[#7cafde]/30">
          <h2 className="font-semibold text-[#0e3d69] mb-3">Additional State Resources</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <a 
              href="https://mn.gov/doc/community-supervision/reentry-resources/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-700 hover:text-[#0e3d69]"
            >
              <ExternalLink className="w-4 h-4" />
              MN DOC Reentry Resources
            </a>
            <a 
              href="https://www.lawhelpmn.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-700 hover:text-[#0e3d69]"
            >
              <ExternalLink className="w-4 h-4" />
              LawHelp Minnesota
            </a>
            <a 
              href="https://mn.gov/deed/job-seekers/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-700 hover:text-[#0e3d69]"
            >
              <ExternalLink className="w-4 h-4" />
              MN Employment Services
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowTo;
