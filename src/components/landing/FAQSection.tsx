'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQ { id: number; question: string; answer: string; }

const faqs: FAQ[] = [
  { id: 1, question: 'How does the leave tracking system work?',
    answer: 'Our system automatically tracks all employee leave requests, approvals, and balances in real-time. Employees submit requests through an intuitive interface, managers receive instant notifications, and the system updates leave balances automatically upon approval.' },
  { id: 2, question: 'Can I integrate HRLeave with existing HR software?',
    answer: 'Yes! HRLeave offers seamless integration with popular HR platforms including Workday, BambooHR, and SAP SuccessFactors. We also provide a robust API for custom integrations.' },
  { id: 3, question: 'Is my employee data secure?',
    answer: 'Absolutely. We use bank-level encryption (AES-256) for all data at rest and in transit. Our platform is SOC 2 Type II certified and fully GDPR compliant. We never share your data with third parties.' },
  { id: 4, question: 'What types of leave can I track?',
    answer: 'You can track all types of leave including vacation days, sick leave, parental leave, bereavement, medical appointments, unpaid leave, and custom leave types specific to your organization.' },
  { id: 5, question: 'Do you offer mobile apps?',
    answer: 'Yes! Our responsive web app works perfectly on mobile devices, and we offer native iOS and Android apps for an even better mobile experience. Employees can request leave and check balances on the go.' },
  { id: 6, question: 'What kind of support do you provide?',
    answer: 'We offer 24/7 email support for all plans, live chat support during business hours, and dedicated account managers for enterprise customers. We also provide comprehensive documentation and video tutorials.' },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: '-30px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function FAQItem({ faq, delay }: { faq: FAQ; delay: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className="border-b last:border-0"
      style={{ borderColor: 'var(--landing-card-border)' }}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group hover:opacity-80 transition-opacity"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <span className="font-semibold text-lg pr-4 transition-colors" style={{ color: 'var(--landing-text-primary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--landing-text-primary)'}>
          {faq.question}
        </span>
        {/* CSS rotate instead of motion.div */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg transition-colors flex items-center justify-center mt-1"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), background-color 0.3s',
            backgroundColor: 'var(--landing-card-bg)'
          }}>
          {isOpen
            ? <Minus size={16} style={{ color: 'var(--primary)' }} />
            : <Plus size={16} style={{ color: 'var(--primary)' }} />}
        </div>
      </button>

      {/* CSS height transition — replaces AnimatePresence */}
      <div
        id={`faq-answer-${faq.id}`}
        className="overflow-hidden"
        style={{
          maxHeight: isOpen ? '400px' : '0px',
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
        }}
      >
        <p className="leading-relaxed pb-5 pr-12" style={{ color: 'var(--landing-text-secondary)', opacity: 0.85 }}>{faq.answer}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const { ref, visible } = useReveal();
  return (
    <section id="faq" className="relative z-10 px-6 md:px-12 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Section header — reveal on scroll */}
        <div ref={ref} className="text-center mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <span className="section-eyebrow">FAQ</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-black leading-tight" style={{ color: 'var(--landing-text-primary)' }}>
            Got questions?{' '}
            <span className="heading-gradient">We&apos;ve got answers</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg" style={{ color: 'var(--landing-text-secondary)', opacity: 0.9 }}>
            Everything you need to know about HRLeave and how it works.
          </p>
        </div>

        {/* FAQ list */}
        <div className="relative rounded-2xl border backdrop-blur-xl p-6 md:p-8" style={{ borderColor: 'var(--landing-card-border)', backgroundColor: 'var(--landing-card-bg)' }}>
          {faqs.map((faq, i) => (
            <FAQItem key={faq.id} faq={faq} delay={i * 0.08} />
          ))}
        </div>

        {/* Still have questions */}
        <div className="text-center mt-10">
          <p className="mb-4" style={{ color: 'var(--landing-text-secondary)', opacity: 0.9 }}>Still have questions?</p>
          <a
            href="mailto:support@hrleave.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border transition-all font-medium"
            style={{ 
              backgroundColor: 'var(--landing-card-bg)', 
              borderColor: 'var(--landing-card-border)',
              color: 'var(--landing-text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-hover)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--landing-card-bg)';
              e.currentTarget.style.color = 'var(--landing-text-primary)';
            }}
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
