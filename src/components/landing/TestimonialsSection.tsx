'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'HR Director',
    company: 'TechCorp Inc.',
    avatar: '',
    rating: 5,
    text: 'HRLeave transformed our leave management process. What used to take hours now takes minutes. The analytics are incredible!',
    gradient: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(244,229,168,0.08))',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Operations Manager',
    company: 'GlobalTech',
    avatar: '',
    rating: 5,
    text: 'The real-time tracking and automated approvals have saved us countless hours. Best HR tool we\'ve ever used.',
    gradient: 'linear-gradient(135deg, rgba(205,127,50,0.12), rgba(170,139,46,0.06))',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Chief People Officer',
    company: 'Innovate LLC',
    avatar: '',
    rating: 5,
    text: 'Finally, a leave management system that employees actually love to use. The face recognition login is a game-changer!',
    gradient: 'linear-gradient(135deg, rgba(192,192,192,0.12), rgba(169,169,169,0.06))',
  },
];

function TestimonialCard({ testimonial, delay }: { testimonial: Testimonial; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{ background: testimonial.gradient }}
      />

      {/* Card */}
      <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col gap-4">
        {/* Quote icon */}
        <div className="flex items-start justify-between">
          <Quote size={32} className="text-[#d4af37]/30" />
          
          {/* Rating */}
          <div className="flex gap-1">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className="fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
        </div>

        {/* Testimonial text */}
        <p className="text-[#f7e7ce]/80 leading-relaxed text-sm flex-1">
          "{testimonial.text}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <Avatar className="w-10 h-10">
            {testimonial.avatar && <AvatarImage src={testimonial.avatar} alt={testimonial.name} />}
            <AvatarFallback className="text-xs bg-gradient-to-br from-[#d4af37] to-[#cd7f32] text-black font-semibold">
              {getInitials(testimonial.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold text-sm">{testimonial.name}</p>
            <p className="text-[#f7e7ce]/50 text-xs">
              {testimonial.role} at {testimonial.company}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="relative z-10 px-6 md:px-12 py-20">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <span className="text-xs text-[#c0c0c0] font-semibold uppercase tracking-widest">
          Testimonials
        </span>
        <h2 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight">
          Loved by{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f4e5a8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            elite HR teams
          </span>
        </h2>
        <p className="mt-4 text-[#f7e7ce]/60 max-w-2xl mx-auto text-lg">
          Don't just take our word for it — hear what our distinguished clients have to say.
        </p>
      </motion.div>

      {/* Testimonials grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {testimonials.map((testimonial, i) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            delay={i * 0.15}
          />
        ))}
      </div>
    </section>
  );
}
