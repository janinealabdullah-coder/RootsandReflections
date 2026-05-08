import PageLayout from "@/components/PageLayout";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <PageLayout overlayOpacity="light">
      <div className="min-h-screen px-5 py-10">
        <div className="max-w-3xl mx-auto bg-background/70 dark:bg-background/50 backdrop-blur-md rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="roots-heading-2">Terms &amp; Conditions</h1>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Last updated May 08, 2026</p>

          <div className="space-y-5 text-base leading-relaxed text-foreground">
            <p>
              Welcome to Roots &amp; Reflections, a service of TJBell Collective ("we," "us," or
              "our"). By creating an account or using our website, mobile application, or related
              services (the "Services"), you agree to these Terms &amp; Conditions ("Terms"). If
              you do not agree, please do not use the Services.
            </p>

            <h2 className="roots-heading-3 pt-4">1. Eligibility</h2>
            <p>
              You must be at least 13 years old to use the Services. By creating an account, you
              represent and warrant that you meet this age requirement and have the legal capacity
              to enter into these Terms.
            </p>

            <h2 className="roots-heading-3 pt-4">2. Your Account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials
              and for all activity that occurs under your account. Notify us immediately at{" "}
              <a href="mailto:contactus@rootsandreflections.love" className="underline text-primary">
                contactus@rootsandreflections.love
              </a>{" "}
              if you suspect unauthorized use.
            </p>

            <h2 className="roots-heading-3 pt-4">3. Your Content</h2>
            <p>
              You retain ownership of the stories, photos, audio, video, and other content you
              upload ("Your Content"). By posting Your Content, you grant us a limited,
              non-exclusive license to host, store, display, and back up Your Content solely for
              the purpose of providing the Services to you and your family group. We do not sell
              Your Content and we do not use it to train third-party AI models.
            </p>
            <p>
              You are solely responsible for Your Content and represent that you have the rights
              necessary to share it. Do not upload content that infringes intellectual property
              rights, violates privacy, or that you do not have permission to share.
            </p>

            <h2 className="roots-heading-3 pt-4">4. Acceptable Use &amp; Community Guidelines</h2>
            <p>You agree not to use the Services to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harass, threaten, or harm any person.</li>
              <li>Post hate speech or discriminatory content.</li>
              <li>Upload sexually explicit material or content that exploits minors.</li>
              <li>Share unlawful content or violate the rights of others.</li>
              <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to the Services.</li>
            </ul>
            <p>
              We may remove content or suspend or terminate accounts that violate these Terms or
              applicable law.
            </p>

            <h2 className="roots-heading-3 pt-4">5. Beta Limits</h2>
            <p>
              During our beta, each family group is limited to up to 10 family members and 50
              stories. These limits may change as we expand the Services.
            </p>

            <h2 className="roots-heading-3 pt-4">6. Privacy</h2>
            <p>
              Your use of the Services is also governed by our{" "}
              <button onClick={() => navigate("/privacy")} className="underline text-primary">
                Privacy Notice
              </button>
              , which describes how we collect, use, and protect your information.
            </p>

            <h2 className="roots-heading-3 pt-4">7. Account Deletion</h2>
            <p>
              You may delete your account and all associated content at any time from your Profile
              page. Account deletion is immediate and irreversible.
            </p>

            <h2 className="roots-heading-3 pt-4">8. Disclaimers</h2>
            <p>
              The Services are provided "as is" and "as available" without warranties of any kind,
              whether express or implied. We do not guarantee that the Services will be
              uninterrupted, secure, or error-free, or that any data will be preserved
              indefinitely. Always keep your own backups of important content.
            </p>

            <h2 className="roots-heading-3 pt-4">9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, TJBell Collective and its affiliates will
              not be liable for any indirect, incidental, special, consequential, or punitive
              damages, or any loss of profits, data, or goodwill, arising from your use of the
              Services.
            </p>

            <h2 className="roots-heading-3 pt-4">10. Termination</h2>
            <p>
              We may suspend or terminate your access to the Services at any time if you violate
              these Terms. You may stop using the Services at any time by deleting your account.
            </p>

            <h2 className="roots-heading-3 pt-4">11. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. If we make material changes, we will
              notify you through the Services or by email. Your continued use of the Services
              after changes take effect constitutes acceptance of the updated Terms.
            </p>

            <h2 className="roots-heading-3 pt-4">12. Contact</h2>
            <p>
              Questions about these Terms? Email us at{" "}
              <a href="mailto:contactus@rootsandreflections.love" className="underline text-primary">
                contactus@rootsandreflections.love
              </a>
              .
            </p>
          </div>

          <div className="pt-4">
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
              Back
            </Button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </PageLayout>
  );
};

export default Terms;
