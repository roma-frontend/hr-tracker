'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: 'How does the leave tracking system work?',
    answer: 'Our system automatically tracks all employee leave requests, approvals, and balances in real-time. Employees submit requests through an intuitive interface, managers receive instant notifications, and the system updates leave balances automatically upon approval.',
  },
  {
    id: 2,
    question: 'Can I integrate HRLeave with existing HR software?',
    answer: 'Yes! HRLeave offers seamless integration with popular HR platforms including Workday, BambooHR, and SAP SuccessFactors. We also provide a robust API for custom integrations.',
  },
  {
    id: 3,
    question: 'Is my employee data secure?',
    answer: 'Absolutely. We use bank-level encryption (AES-256) for all data at rest and in transit. Our platform is SOC 2 Type II certified and fully GDPR compliant. We never share your data with third parties.',
  },
  {
    id: 4,
    question: 'What types of leave can I track?',
    answer: 'You can track all types of leave including vacation days, sick leave, parental leave, bereavement, medical appointments, unpaid leave, and custom leave types specific to your organization.',
  },
  {
    id: 5,
    question: 'Do you offer mobile apps?',
    answer: 'Yes! Our responsive web app works perfectly on mobile devices, and we offer native iOS and Android apps for an even better mobile experience. Employees can request leave and check balances on the go.',
  },
  {
    id: 6,
    question: 'What kind of support do you provide?',
    answer: 'We offer 24/7 email support for all plans, live chat support during business hours, and dedicated account managers for enterprise customers. We also provide comprehensive documentation and video tutorials.',
  },
];

function FAQItem({ faq, delay }: { faq: FAQ; delay: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="border-b border-white/5 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group hover:opacity-80 transition-opacity"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <span className="text-white font-semibold text-lg pr-4 group-hover:text-[#a78bfa] transition-colors">
          {faq.question}
        </span>
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors flex items-center justify-center mt-1"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <Minus size={16} className="text-[#a78bfa]" />
            ) : (
              <Plus size={16} className="text-[#a78bfa]" />
            )}
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${faq.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[#e0d9ff]/70 leading-relaxed pb-5 pr-12">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section id="faq" className="relative z-10 px-6 md:px-12 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="text-xs text-[#c4b5fd] font-semibold uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight">
            Got questions?{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              We've got answers
            </span>
          </h2>
          <p className="mt-4 text-[#e0d9ff]/60 max-w-2xl mx-auto text-lg">
            Everything you need to know about HRLeave and how it works.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.id} faq={faq} delay={i * 0.08} />
          ))}
        </div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10"
        >
          <p className="text-[#e0d9ff]/60 mb-4">Still have questions?</p>
          <a
            href="mailto:support@hrleave.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8b5cf6]/5 hover:bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#e0d9ff] hover:text-[#a78bfa] transition-all font-medium"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}
