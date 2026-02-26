'use client';

import { useRef, useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  id: number; name: string; role: string; company: string;
  avatar: string; rating: number; text: string; gradient: string;
}

const testimonials: Testimonial[] = [
  { id: 1, name: 'Sarah Johnson', role: 'HR Director', company: 'TechCorp Inc.', avatar: '', rating: 5,
    text: 'HRLeave transformed our leave management process. What used to take hours now takes minutes. The analytics are incredible!',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(165,180,252,0.08))' },
  { id: 2, name: 'Michael Chen', role: 'Operations Manager', company: 'GlobalTech', avatar: '', rating: 5,
    text: "The real-time tracking and automated approvals have saved us countless hours. Best HR tool we've ever used.",
    gradient: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(79,70,229,0.06))' },
  { id: 3, name: 'Emily Rodriguez', role: 'Chief People Officer', company: 'Innovate LLC', avatar: '', rating: 5,
    text: 'Finally, a leave management system that employees actually love to use. The face recognition login is a game-changer!',
    gradient: 'linear-gradient(135deg, rgba(148,163,184,0.12), rgba(148,163,184,0.06))' },
];

function useReveal(margin = '-50px') {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: margin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margin]);
  return { ref, visible };
}

function TestimonialCard({ testimonial, delay }: { testimonial: Testimonial; delay: number }) {
  const { ref, visible } = useReveal('-50px');
  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('');

  return (
    <div
      ref={ref}
      className="relative group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(50px)',
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{ background: testimonial.gradient }} aria-hidden="true" />

      {/* Card — lifts on hover */}
      <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col gap-4 group-hover:-translate-y-2 transition-transform duration-300">
        <div className="flex items-start justify-between">
          <Quote size={32} className="text-blue-400/30" />
          <div className="flex gap-1">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
        <p className="text-blue-100/80 leading-relaxed text-sm flex-1">"{testimonial.text}"</p>
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <Avatar className="w-10 h-10">
            {testimonial.avatar && <AvatarImage src={testimonial.avatar} alt={testimonial.name} />}
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {getInitials(testimonial.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold text-sm">{testimonial.name}</p>
            <p className="text-blue-200/50 text-xs">{testimonial.role} at {testimonial.company}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const { ref, visible } = useReveal('-30px');
  return (
    <section className="relative z-10 px-6 md:px-12 py-20">
      {/* Section header — reveal on scroll */}
      <div ref={ref} className="text-center mb-16"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <span className="section-eyebrow">Testimonials</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight">
          Loved by <span className="heading-gradient">elite HR teams</span>
        </h2>
        <p className="mt-4 text-blue-200/60 max-w-2xl mx-auto text-lg">
          Don't just take our word for it — hear what our distinguished clients have to say.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {testimonials.map((t, i) => (
          <TestimonialCard key={t.id} testimonial={t} delay={i * 0.15} />
        ))}
      </div>
    </section>
  );
}
