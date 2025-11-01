import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Phone, Mail } from 'lucide-react';
import GSAPButton from '@/components/GSAPButton';

const ContactSection: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.section
      id="contact"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative bg-gradient-to-br from-blue-900 to-indigo-950 text-white overflow-hidden py-16 md:py-24"
    >
      <div className="absolute inset-[-50px] z-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl animate-blob-1"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl animate-blob-2"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-screen filter blur-3xl animate-blob-3"></div>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        <h3 className="text-4xl md:text-5xl font-extrabold text-center mb-6 drop-shadow-lg font-guncen">HUBUNGI KAMI</h3>
        <p className="text-lg text-gray-300 text-center mb-16 max-w-3xl mx-auto">
          Kami siap membantu Anda. Jangan ragu untuk menghubungi kami melalui informasi di bawah ini atau kirimkan pesan langsung.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 1, 0.2, 1] }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-primary transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center"
          >
            <div className="p-5 rounded-full bg-primary/20 text-primary-foreground mb-6">
              <Phone className="h-10 w-10" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Telepon / WhatsApp</h4>
            <p className="text-xl text-gray-200 mb-6">031-8667427</p>
            <a href="tel:+62318667427" className="w-full">
              <GSAPButton variant="default" className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-semibold rounded-full shadow-md">
                <Phone className="mr-2 h-5 w-5" /> Telepon Sekarang
              </GSAPButton>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.2, 1, 0.2, 1] }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-accent transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center"
          >
            <div className="p-5 rounded-full bg-accent/20 text-accent-foreground mb-6">
              <Mail className="h-10 w-10" />
            </div>
            <h4 className="2xl font-bold text-white mb-3">Email</h4>
            <p className="text-xl text-gray-200 mb-6">perpustakaan@smpn1sedati.sch.id</p>
            <a href="mailto:perpustakaan@smpn1sedati.sch.id" className="w-full">
              <GSAPButton variant="default" className="w-full bg-accent hover:bg-accent/90 text-white py-3 text-lg font-semibold rounded-full shadow-md">
                <Mail className="mr-2 h-5 w-5" /> Kirim Email
              </GSAPButton>
            </a>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default ContactSection;