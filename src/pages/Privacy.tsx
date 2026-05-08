import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <PageLayout overlayOpacity="light">
      <div className="min-h-screen px-5 py-10">
        <div className="max-w-3xl mx-auto bg-background/70 dark:bg-background/50 backdrop-blur-md rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="roots-heading-2">Privacy Notice</h1>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Last updated May 08, 2026</p>

          <div className="space-y-5 text-base leading-relaxed text-foreground">
            <p>
              This Privacy Notice for TJBell Collective (doing business as Roots and Reflections)
              ("we," "us," or "our"), describes how and why we might access, collect, store, use,
              and/or share ("process") your personal information when you use our services
              ("Services"), including when you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Visit our website at{" "}
                <a
                  href="https://rootsandreflections.love"
                  className="underline text-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://rootsandreflections.love
                </a>{" "}
                or any website of ours that links to this Privacy Notice.
              </li>
              <li>
                Download and use our mobile application (Roots and Reflections), or any other
                application of ours that links to this Privacy Notice.
              </li>
              <li>
                Use Roots and Reflections — a family storytelling platform that allows members
                across generations to contribute, preserve, and explore their shared history.
                Unlike genealogy tools that focus on dates and records, this app centers on living
                stories — written, audio, photo, and video memories submitted by real family
                members and organized around a visual family tree.
              </li>
              <li>Engage with us in other related ways, including any marketing or events.</li>
            </ul>
            <p>
              <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you
              understand your privacy rights and choices. We are responsible for making decisions
              about how your personal information is processed. If you do not agree with our
              policies and practices, please do not use our Services. If you still have any
              questions or concerns, please contact us at{" "}
              <a href="mailto:policy@rootsandreflections.love" className="underline text-primary">
                policy@rootsandreflections.love
              </a>
              .
            </p>

            <h2 className="roots-heading-3 pt-4">Summary of Key Points</h2>
            <p>
              This summary provides key points from our Privacy Notice, but you can find out more
              details about any of these topics by clicking the link following each key point or
              by using our table of contents below to find the section you are looking for.
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>What personal information do we process?</strong> When you visit, use, or
                navigate our Services, we may process personal information depending on how you
                interact with us and the Services, the choices you make, and the products and
                features you use.
              </li>
              <li>
                <strong>Do we process any sensitive personal information?</strong> Some
                information may be considered "special" or "sensitive" in certain jurisdictions
                (e.g., racial or ethnic origins, sexual orientation, religious beliefs). We may
                process sensitive personal information when necessary with your consent or as
                otherwise permitted by applicable law.
              </li>
              <li>
                <strong>Do we collect any information from third parties?</strong> We do not
                collect any information from third parties.
              </li>
              <li>
                <strong>How do we process your information?</strong> We process your information
                to provide, improve, and administer our Services, communicate with you, for
                security and fraud prevention, and to comply with law. We process your
                information only when we have a valid legal reason to do so.
              </li>
              <li>
                <strong>In what situations and with which parties do we share personal
                information?</strong> We may share information in specific situations and with
                specific third parties.
              </li>
              <li>
                <strong>What are your rights?</strong> Depending on where you are located
                geographically, applicable privacy law may give you certain rights regarding your
                personal information.
              </li>
              <li>
                <strong>How do you exercise your rights?</strong> The easiest way is by
                submitting a data subject access request (use the "Download My Data" or "Delete
                My Account" tools on your Profile page), or by contacting us. We will consider
                and act upon any request in accordance with applicable data protection laws.
              </li>
            </ul>

            <h2 className="roots-heading-3 pt-4">Table of Contents</h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>What information do we collect?</li>
              <li>How do we process your information?</li>
              <li>What legal bases do we rely on to process your personal information?</li>
              <li>When and with whom do we share your personal information?</li>
              <li>Do we use cookies and other tracking technologies?</li>
              <li>How long do we keep your information?</li>
              <li>Do we collect information from minors?</li>
              <li>What are your privacy rights?</li>
              <li>Controls for do-not-track features</li>
              <li>Do United States residents have specific privacy rights?</li>
              <li>Do we make updates to this notice?</li>
              <li>How can you contact us about this notice?</li>
              <li>How can you review, update, or delete the data we collect from you?</li>
            </ol>

            <h2 className="roots-heading-3 pt-4">1. What Information Do We Collect?</h2>
            <p>
              <em>In short:</em> We collect personal information that you provide to us.
            </p>
            <p>
              We collect personal information that you voluntarily provide to us when you register
              on the Services, express an interest in obtaining information about us or our
              products and Services, when you participate in activities on the Services, or
              otherwise when you contact us. The personal information we collect may include:
              names, email addresses, phone numbers, usernames, passwords, contact preferences,
              debit/credit card numbers, contact or authentication data, and billing addresses.
            </p>
            <p>
              <strong>Sensitive Information.</strong> When necessary, with your consent or as
              otherwise permitted by applicable law, we process certain categories of sensitive
              information.
            </p>
            <p>
              <strong>Application Data.</strong> If you use our application(s), we may also
              collect device camera, contacts, microphone, and storage access (only with your
              permission), mobile device data (model, OS, identifiers, IP address), and push
              notification preferences. You can change these in your device settings.
            </p>
            <p>
              <strong>Information Automatically Collected.</strong> Some information — such as IP
              address and browser/device characteristics — is collected automatically when you
              visit our Services. This includes log/usage data, device data, and (where
              applicable) location data. This information is primarily needed to maintain the
              security and operation of our Services and for internal analytics and reporting.
            </p>

            <h2 className="roots-heading-3 pt-4">2. How Do We Process Your Information?</h2>
            <p>
              <em>In short:</em> We process your information to provide, improve, and administer
              our Services, communicate with you, for security and fraud prevention, and to
              comply with law. We may also process your information for other purposes only with
              your prior explicit consent.
            </p>

            <h2 className="roots-heading-3 pt-4">
              7. Do We Collect Information From Minors?
            </h2>
            <p>
              We do not knowingly collect data from or market to children under 13 years of age.
              By using the Services, you represent that you are at least 13. If we learn that
              personal information from users less than 13 years of age has been collected, we
              will deactivate the account and take reasonable measures to promptly delete such
              data.
            </p>

            <h2 className="roots-heading-3 pt-4">
              13. How Can You Review, Update, or Delete Your Data?
            </h2>
            <p>
              You can download a complete copy of your account data or permanently delete your
              account and all associated content at any time from the{" "}
              <button
                onClick={() => navigate("/profile")}
                className="underline text-primary"
              >
                Profile page
              </button>
              . Account deletion is immediate and irreversible.
            </p>

            <h2 className="roots-heading-3 pt-4">12. Contact Us</h2>
            <p>
              If you have questions or comments about this notice, you may email us at{" "}
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
    </PageLayout>
  );
};

export default Privacy;
