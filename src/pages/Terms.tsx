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
            <h1 className="roots-heading-2">Terms of Service</h1>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Last updated May 08, 2026</p>

          <div className="space-y-5 text-base leading-relaxed text-foreground">
            <p>
              These Terms of Service ("Terms") govern your use of the services provided by TJBell
              Collective (doing business as Roots and Reflections) ("we," "us," or "our"),
              including our website at{" "}
              <a
                href="https://rootsandreflections.love"
                className="underline text-primary"
                target="_blank"
                rel="noreferrer"
              >
                https://rootsandreflections.love
              </a>
              , our mobile application, and any related services (collectively, the "Services").
              By creating an account or using the Services, you agree to these Terms. If you do
              not agree, please do not use the Services.
            </p>

            <h2 className="roots-heading-3 pt-4">1. Eligibility</h2>
            <p>
              You must be at least 13 years of age to create an account or use the Services. By
              using the Services, you represent that you meet this age requirement and have the
              legal capacity to enter into these Terms.
            </p>

            <h2 className="roots-heading-3 pt-4">2. Your Account</h2>
            <p>
              You are responsible for safeguarding your login credentials and for all activity
              that occurs under your account. Notify us immediately at{" "}
              <a href="mailto:policy@rootsandreflections.love" className="underline text-primary">
                policy@rootsandreflections.love
              </a>{" "}
              if you suspect unauthorized use of your account.
            </p>

            <h2 className="roots-heading-3 pt-4">3. User Content Ownership</h2>
            <p>
              You retain full ownership of the stories, photos, audio, video, and other content
              you upload to the Services ("Your Content"). We do not claim ownership of Your
              Content, we do not sell it, and we do not use it to train third-party AI models.
            </p>
            <p>
              By posting Your Content, you grant us a limited, non-exclusive, worldwide,
              royalty-free license to host, store, display, back up, and transmit Your Content
              solely for the purpose of operating and providing the Services to you and the
              members of your family group. This license ends when you delete Your Content or
              your account, except for backups retained for a reasonable period as required for
              operations or by law.
            </p>
            <p>
              You represent and warrant that you have all rights necessary to share Your Content
              and that doing so does not violate the rights of any third party.
            </p>

            <h2 className="roots-heading-3 pt-4">4. Acceptable Use</h2>
            <p>You agree not to use the Services to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harass, threaten, bully, or harm any person.</li>
              <li>Post hate speech, discriminatory content, or content that incites violence.</li>
              <li>
                Upload, share, or solicit any content that sexualizes, exploits, or endangers
                minors. This is strictly prohibited and will result in immediate account
                termination and, where applicable, reporting to law enforcement.
              </li>
              <li>Share unlawful content or content that infringes intellectual property or privacy rights.</li>
              <li>
                Attempt to disrupt, reverse-engineer, scrape, or gain unauthorized access to the
                Services or other users' accounts or data.
              </li>
              <li>Use the Services to send spam, malware, or other harmful code.</li>
            </ul>

            <h2 className="roots-heading-3 pt-4">5. Account Termination</h2>
            <p>
              We may suspend or terminate your account, remove content, or restrict access to the
              Services at any time, with or without notice, if we reasonably believe you have
              violated these Terms, applicable law, or the rights of others, or if continued
              access poses a risk to other users or to the Services. In serious cases — including
              any violation involving minors — termination will be immediate.
            </p>
            <p>
              You may stop using the Services and delete your account at any time from your
              Profile page. Account deletion is immediate and irreversible.
            </p>

            <h2 className="roots-heading-3 pt-4">6. Beta Limitations</h2>
            <p>
              The Services are currently offered as a free beta. During the beta, each family
              group is limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Up to 10 family members per family group.</li>
              <li>Up to 50 stories per family group.</li>
            </ul>
            <p>
              Features, limits, and availability may change as we evolve the Services. We do not
              guarantee that the Services will be uninterrupted, error-free, or that any data
              will be preserved indefinitely. Please keep your own backups of important content.
            </p>

            <h2 className="roots-heading-3 pt-4">7. Privacy</h2>
            <p>
              Your use of the Services is also governed by our{" "}
              <button onClick={() => navigate("/privacy")} className="underline text-primary">
                Privacy Notice
              </button>
              , which describes how we collect, use, and protect your information.
            </p>

            <h2 className="roots-heading-3 pt-4">8. Disclaimers</h2>
            <p>
              The Services are provided "as is" and "as available" without warranties of any
              kind, whether express or implied, including warranties of merchantability, fitness
              for a particular purpose, and non-infringement.
            </p>

            <h2 className="roots-heading-3 pt-4">9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, TJBell Collective and its affiliates will
              not be liable for any indirect, incidental, special, consequential, or punitive
              damages, or any loss of profits, data, goodwill, or content, arising out of or
              relating to your use of the Services.
            </p>

            <h2 className="roots-heading-3 pt-4">10. Dispute Resolution &amp; Governing Law</h2>
            <p>
              These Terms and any dispute arising out of or relating to these Terms or the
              Services will be governed by and construed in accordance with the laws of the
              State of Washington, USA, without regard to its conflict-of-laws principles. You
              agree that the exclusive venue and jurisdiction for any dispute that is not
              required to be resolved informally or through arbitration will be the state and
              federal courts located in King County, Washington, and you consent to the personal
              jurisdiction of those courts.
            </p>
            <p>
              Before filing a claim, you agree to first contact us at{" "}
              <a href="mailto:policy@rootsandreflections.love" className="underline text-primary">
                policy@rootsandreflections.love
              </a>{" "}
              and attempt to resolve the dispute informally in good faith.
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
              <a href="mailto:policy@rootsandreflections.love" className="underline text-primary">
                policy@rootsandreflections.love
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
