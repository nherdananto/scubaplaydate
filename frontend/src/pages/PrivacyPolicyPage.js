import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { EnvelopeSimple } from '@phosphor-icons/react';

const CONTACT_EMAIL = 'boolixious@gmail.com';
const LAST_UPDATED = 'May 2026';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl md:text-3xl font-bold text-[#0A0F1C] tracking-tight mb-4">
      {title}
    </h2>
    <div className="text-[#475569] leading-relaxed space-y-3">{children}</div>
  </section>
);

const BulletList = ({ items }) => (
  <ul className="list-disc pl-6 space-y-2 text-[#475569]">
    {items.map((item, idx) => (
      <li key={idx} className="leading-relaxed">{item}</li>
    ))}
  </ul>
);

const PrivacyPolicyPage = () => {
  return (
    <div data-testid="privacy-policy-page" className="bg-white">
      <Navbar />

      <article className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <header className="mb-12 text-center">
            <span className="inline-block bg-[#F1F5F9] text-[#475569] px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider mb-4">
              Legal
            </span>
            <h1
              data-testid="privacy-policy-title"
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A0F1C] mb-4 tracking-tighter"
            >
              Privacy Policy
            </h1>
            <p className="text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
              This Privacy Policy explains how ScubaPlaydate collects, uses, and
              protects your information.
            </p>
          </header>

          <Section title="Information We Collect">
            <p>We may collect the following information:</p>
            <BulletList
              items={[
                'Name and email address (if you contact us or submit content)',
                'Information you provide when submitting articles',
                'Basic usage data (via analytics tools)',
              ]}
            />
          </Section>

          <Section title="How We Use Your Information">
            <p>We use your information to:</p>
            <BulletList
              items={[
                'Respond to inquiries and submissions',
                'Review and publish contributed content',
                'Improve our website and user experience',
              ]}
            />
            <p className="pt-2">
              We do not sell or share your personal data with third parties for
              marketing purposes.
            </p>
          </Section>

          <Section title="Cookies">
            <p>ScubaPlaydate may use cookies to:</p>
            <BulletList
              items={[
                'Understand user behavior',
                'Improve website performance',
              ]}
            />
            <p className="pt-2">
              You can disable cookies through your browser settings.
            </p>
          </Section>

          <Section title="Third-Party Services">
            <p>We may use third-party tools such as:</p>
            <BulletList items={['Analytics providers (e.g. Google Analytics)']} />
            <p className="pt-2">
              These services may collect anonymous usage data in accordance with
              their own policies.
            </p>
          </Section>

          <Section title="Content Submissions">
            <p>When you submit content:</p>
            <BulletList
              items={[
                'You grant us permission to publish and edit your material',
                'You confirm that the content is your own and does not violate any rights',
              ]}
            />
          </Section>

          <Section title="Data Security">
            <p>
              We take reasonable steps to protect your information, but no method
              of transmission over the internet is 100% secure.
            </p>
          </Section>

          <Section title="Links to Other Websites">
            <p>
              Our website may contain links to external sites. We are not responsible
              for their content or privacy practices.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Updates will be
              posted on this page.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              If you have any questions about this Privacy Policy, you can contact
              us at:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              data-testid="privacy-contact-email"
              className="inline-flex items-center gap-2 mt-2 text-[#0284C7] hover:text-[#0369A1] font-medium transition-colors"
            >
              <EnvelopeSimple size={18} weight="bold" />
              {CONTACT_EMAIL}
            </a>
          </Section>

          <div className="mt-12 pt-6 border-t border-[#E2E8F0]">
            <p className="text-sm text-[#94A3B8]">
              <span className="font-semibold text-[#475569]">Last Updated:</span>{' '}
              {LAST_UPDATED}
            </p>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
