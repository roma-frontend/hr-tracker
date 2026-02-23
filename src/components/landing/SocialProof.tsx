'use client';

import { motion } from 'framer-motion';
import { Users, Award, TrendingUp, Globe } from 'lucide-react';

const metrics = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Active Users',
    color: '#d4af37',
  },
  {
    icon: Award,
    value: '4.9/5',
    label: 'Customer Rating',
    color: '#f4e5a8',
  },
  {
    icon: TrendingUp,
    value: '99.9%',
    label: 'Uptime',
    color: '#cd7f32',
  },
  {
    icon: Globe,
    value: '50+',
    label: 'Countries',
    color: '#c0c0c0',
  },
];

export default function SocialProof() {
  return (
    <section className="relative z-10 py-12 border-y border-[#d4af37]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <Icon size={24} style={{ color: metric.color }} />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-[#f7e7ce]/60">{metric.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
