import PageLayout from "@/components/PageLayout";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CONTACT_EMAIL = "contactus@rootsandreflections.love";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <PageLayout overlayOpacity="light">
      <div className="min-h-screen px-5 py-10">
        <div className="max-w-2xl mx-auto bg-background/70 dark:bg-background/50 backdrop-blur-md rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="roots-heading-2">Contact Us</h1>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>

          <div className="space-y-5 text-base leading-relaxed text-foreground">
            <p>
              We'd love to hear from you. Whether you have a question, need help with your
              account, want to report a problem, or just want to share feedback, our team is here
              to listen.
            </p>

            <div className="rounded-xl border border-border bg-background/60 p-6 flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary shrink-0">
                <Mail className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Email</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-lg text-primary underline underline-offset-4 break-all"
                >
                  {CONTACT_EMAIL}
                </a>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 1–2 business days.
                </p>
              </div>
            </div>

            <h2 className="roots-heading-3 pt-2">What to include</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The email address associated with your account (if any).</li>
              <li>A clear description of your question or the issue you're seeing.</li>
              <li>Screenshots, if helpful.</li>
            </ul>

            <h2 className="roots-heading-3 pt-2">Privacy &amp; account requests</h2>
            <p>
              For privacy questions, data access requests, or account deletion help, you can also
              reach our policy team at{" "}
              <a href="mailto:policy@rootsandreflections.love" className="underline text-primary">
                policy@rootsandreflections.love
              </a>
              . Logged-in users can download their data or delete their account at any time from
              the Profile page.
            </p>
          </div>

          <div className="pt-2">
            <a href={`mailto:${CONTACT_EMAIL}`} className="block">
              <Button size="xl" className="w-full">
                Email Us
              </Button>
            </a>
          </div>
        </div>
      </div>
      <SiteFooter />
    </PageLayout>
  );
};

export default Contact;
