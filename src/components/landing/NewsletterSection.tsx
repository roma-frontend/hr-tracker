'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    }, 1000);
  };

  return (
    <section className="relative z-10 px-6 md:px-12 py-20">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-3xl mx-auto"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/15 via-[#cd7f32]/15 to-[#c0c0c0]/10 rounded-3xl blur-3xl" />
        
        <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12 text-center overflow-hidden">
          {/* Animated background orb */}
          <motion.div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-[#d4af37]/25 to-[#cd7f32]/20 blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          {/* Icon */}
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#cd7f32] mb-6"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Mail size={28} className="text-black" />
          </motion.div>

          {/* Heading */}
          <h3 className="text-2xl md:text-4xl font-black text-white mb-4">
            Stay in the loop
          </h3>
          <p className="text-[#f7e7ce]/70 text-lg mb-8 max-w-xl mx-auto">
            Get the latest updates on HR trends, premium features, and exclusive insights delivered to your inbox.
          </p>

          {/* Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-5 py-4 rounded-xl bg-white/10 border border-[#d4af37]/20 text-white placeholder:text-[#f7e7ce]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]/50 transition-all"
                  disabled={isLoading}
                  aria-label="Email address"
                />
              </div>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f4e5a8] text-black font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#d4af37]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-[#d4af37] font-semibold"
            >
              <CheckCircle2 size={24} />
              <span>You're subscribed! Check your inbox.</span>
            </motion.div>
          )}

          {/* Privacy notice */}
          <p className="text-xs text-[#f7e7ce]/40 mt-6">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
