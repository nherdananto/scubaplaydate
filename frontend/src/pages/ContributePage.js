import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Camera,
  ChatCircleText,
  ShoppingBag,
  MapPin,
  GraduationCap,
  EnvelopeSimple,
  CheckCircle,
} from '@phosphor-icons/react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const SUBMIT_EMAIL = 'boolixious@gmail.com';

const categoryItems = [
  { icon: Camera, name: 'Photography', desc: 'Underwater shots, photo stories, behind-the-scenes' },
  { icon: ChatCircleText, name: 'Stories', desc: 'Personal dive experiences, encounters, travel logs' },
  { icon: ShoppingBag, name: 'Gear', desc: 'Reviews, comparisons, real-world usage' },
  { icon: MapPin, name: 'Destinations', desc: 'Dive guides, local insights' },
  { icon: GraduationCap, name: 'Training & Tips', desc: 'Safety, skills, advice' },
];

const guidelines = [
  'Content must be original and not published elsewhere',
  'Write in clear, simple English',
  'Include high-quality images (if available)',
  'Recommended length: 800–1500 words',
  'Add your name and short bio',
];

const emailItems = [
  'Article (Google Docs or Word file preferred)',
  'Images (attached or download link)',
  'Your name',
  'Short bio (2–3 sentences)',
  'Instagram or website (optional)',
];

const reviewSteps = [
  'We review every submission manually',
  'If selected, we may edit for clarity and formatting',
  'Not all submissions will be published',
];

const creditPerks = [
  'Full credit (name + bio)',
  'Optional link to your social media or website',
];

const Section = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-2xl md:text-3xl font-bold text-[#0A0F1C] tracking-tight mb-5">
      {title}
    </h2>
    {children}
  </section>
);

const BulletList = ({ items, testIdPrefix }) => (
  <ul className="space-y-3">
    {items.map((item, idx) => (
      <li
        key={idx}
        data-testid={`${testIdPrefix}-${idx}`}
        className="flex items-start gap-3 text-[#475569]"
      >
        <CheckCircle
          size={20}
          weight="fill"
          className="text-[#0284C7] mt-0.5 flex-shrink-0"
        />
        <span className="leading-relaxed">{item}</span>
      </li>
    ))}
  </ul>
);

const ContributePage = () => {
  useDocumentMeta({
    title: 'Write for ScubaPlaydate',
    description: 'Share your scuba diving stories, photography, gear reviews, and dive guides with the ScubaPlaydate community.',
  });
  return (
    <div data-testid="contribute-page" className="bg-white">
      <Navbar />

      <article className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <header className="mb-12 text-center">
            <span className="inline-block bg-[#E0F2FE] text-[#0284C7] px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider mb-4">
              Contribute
            </span>
            <h1
              data-testid="contribute-title"
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A0F1C] mb-4 tracking-tighter"
            >
              Write for ScubaPlaydate
            </h1>
            <p className="text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
              We welcome divers, underwater photographers, and ocean lovers to share
              their stories, insights, and experiences with the community. If you have
              something worth sharing, we'd love to feature your work on ScubaPlaydate.
            </p>
          </header>

          <Section title="What You Can Submit">
            <p className="text-[#475569] mb-5">
              We accept original content in the following categories:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryItems.map(({ icon: Icon, name, desc }) => (
                <div
                  key={name}
                  data-testid={`category-${name.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                  className="flex items-start gap-3 p-4 border border-[#E2E8F0] rounded-sm hover:border-[#0284C7] transition-colors"
                >
                  <Icon size={22} weight="bold" className="text-[#0284C7] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[#0A0F1C]">{name}</h3>
                    <p className="text-sm text-[#475569] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Submission Guidelines">
            <BulletList items={guidelines} testIdPrefix="guideline" />
          </Section>

          <Section title="How to Submit">
            <p className="text-[#475569] mb-4">Send your article via email:</p>

            <a
              href={`mailto:${SUBMIT_EMAIL}?subject=${encodeURIComponent('Contributor for ScubaPlaydate | [Category]')}`}
              data-testid="contribute-email-button"
              className="inline-flex items-center gap-3 bg-[#0284C7] hover:bg-[#0369A1] text-white px-6 py-3 rounded-sm font-medium transition-colors mb-6"
            >
              <EnvelopeSimple size={20} weight="bold" />
              {SUBMIT_EMAIL}
            </a>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm p-5 mb-2">
              <p className="text-sm font-semibold text-[#0A0F1C] mb-2">
                Email Subject Format:
              </p>
              <code className="block text-sm text-[#0284C7] bg-white border border-[#E2E8F0] rounded-sm px-3 py-2 mb-3 font-mono">
                Contributor for ScubaPlaydate | [Category]
              </code>
              <p className="text-sm text-[#64748B] mb-1">Example:</p>
              <code className="block text-sm text-[#475569] bg-white border border-[#E2E8F0] rounded-sm px-3 py-2 font-mono">
                Contributor for ScubaPlaydate | Photography
              </code>
            </div>
          </Section>

          <Section title="What to Include in Your Email">
            <BulletList items={emailItems} testIdPrefix="email-item" />
          </Section>

          <Section title="Review Process">
            <BulletList items={reviewSteps} testIdPrefix="review-step" />
          </Section>

          <Section title="Contributor Credit">
            <p className="text-[#475569] mb-4">
              All published contributors will receive:
            </p>
            <BulletList items={creditPerks} testIdPrefix="credit-perk" />
          </Section>

          <div className="mt-16 p-5 border-l-4 border-[#F26419] bg-[#FFF4ED] rounded-sm">
            <p className="text-sm text-[#475569] leading-relaxed">
              <strong className="text-[#0A0F1C]">Note:</strong> By submitting your
              content, you agree that ScubaPlaydate may publish and edit your article.
            </p>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default ContributePage;
