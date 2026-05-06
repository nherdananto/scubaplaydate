import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Camera,
  ChatCircleText,
  ShoppingBag,
  MapPin,
  GraduationCap,
  EnvelopeSimple,
  Compass,
  ArrowRight,
} from '@phosphor-icons/react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const CONTACT_EMAIL = 'boolixious@gmail.com';

const Section = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-2xl md:text-3xl font-bold text-[#0A0F1C] tracking-tight mb-4">
      {title}
    </h2>
    <div className="text-[#475569] leading-relaxed space-y-4">{children}</div>
  </section>
);

const BulletList = ({ items }) => (
  <ul className="list-disc pl-6 space-y-2 text-[#475569]">
    {items.map((item, idx) => (
      <li key={idx} className="leading-relaxed">{item}</li>
    ))}
  </ul>
);

const whatWeDo = [
  { icon: ChatCircleText, name: 'Dive Stories', desc: 'Personal experiences and underwater encounters' },
  { icon: Camera, name: 'Photography', desc: 'Showcasing the beauty of marine life and dive moments' },
  { icon: MapPin, name: 'Destinations', desc: 'Guides and insights from dive locations around the world' },
  { icon: ShoppingBag, name: 'Gear', desc: 'Real-world reviews and recommendations' },
  { icon: GraduationCap, name: 'Training & Tips', desc: 'Practical advice for divers at all levels' },
];

const AboutPage = () => {
  useDocumentMeta({
    title: 'About ScubaPlaydate',
    description: 'ScubaPlaydate is a digital space for divers to explore, share, and stay connected with the underwater world.',
  });
  return (
    <div data-testid="about-page" className="bg-white">
      <Navbar />

      <article className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <header className="mb-12 text-center">
            <span className="inline-block bg-[#E0F2FE] text-[#0284C7] px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider mb-4">
              About Us
            </span>
            <h1
              data-testid="about-title"
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A0F1C] mb-4 tracking-tighter"
            >
              About ScubaPlaydate
            </h1>
            <p className="text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
              ScubaPlaydate is a digital space for divers to explore, share, and stay
              connected with the underwater world.
            </p>
          </header>

          <Section title="Who We Are">
            <p>
              We focus on real stories, honest insights, and visual experiences from
              people who actually dive — whether it's a casual fun dive, a remote
              expedition, or a once-in-a-lifetime encounter beneath the surface.
            </p>
          </Section>

          <Section title="What We Do">
            <p>
              ScubaPlaydate brings together content from across the diving community,
              covering:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {whatWeDo.map(({ icon: Icon, name, desc }) => (
                <div
                  key={name}
                  data-testid={`about-cat-${name.toLowerCase().replace(/[^a-z]+/g, '-')}`}
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

          <Section title="Our Approach">
            <p>We keep things simple:</p>
            <BulletList
              items={[
                'Content is community-driven',
                'Stories are authentic, not overly polished',
                'Focus is on real diving experiences, not just marketing',
              ]}
            />
            <p className="pt-2 italic text-[#0A0F1C]">
              We believe diving is best shared — not just logged.
            </p>
          </Section>

          <Section title="Built for Divers">
            <p>ScubaPlaydate is created for:</p>
            <BulletList
              items={[
                'Certified divers',
                'Beginners curious about diving',
                'Underwater photographers',
                'Ocean enthusiasts',
              ]}
            />
            <p className="pt-2">
              Whether you're here to learn, explore, or contribute, you're part of the
              same community.
            </p>
          </Section>

          <Section title="Contribute">
            <p>We welcome contributions from divers around the world.</p>
            <p>
              If you have a story, photos, or insights to share, check out our{' '}
              <Link
                to="/contribute"
                data-testid="about-contribute-link"
                className="text-[#0284C7] hover:text-[#0369A1] font-medium underline-offset-2 hover:underline"
              >
                Write for ScubaPlaydate
              </Link>{' '}
              page to get started.
            </p>
            <Link
              to="/contribute"
              className="inline-flex items-center gap-2 mt-2 text-[#0284C7] hover:text-[#0369A1] font-medium transition-colors group"
            >
              Start contributing
              <ArrowRight
                size={18}
                weight="bold"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </Section>

          <Section title="Our Vision">
            <p>To become a go-to platform where divers can:</p>
            <div className="flex items-start gap-3 p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm">
              <Compass size={24} weight="bold" className="text-[#0284C7] mt-0.5 flex-shrink-0" />
              <ul className="space-y-2 text-[#475569]">
                <li>Discover new dive experiences</li>
                <li>Learn from others</li>
                <li>Share their own underwater stories</li>
              </ul>
            </div>
          </Section>

          <Section title="Contact">
            <p>For inquiries, collaborations, or submissions:</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              data-testid="about-contact-email"
              className="inline-flex items-center gap-3 mt-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-6 py-3 rounded-sm font-medium transition-colors"
            >
              <EnvelopeSimple size={20} weight="bold" />
              {CONTACT_EMAIL}
            </a>
          </Section>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default AboutPage;
