// components/dashboard-content/Help.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { HelpCircle, Mail, Phone, MessageSquare, BookOpen, ChevronDown, Smartphone, Monitor, Headphones, Zap, Lightbulb, Video } from 'lucide-react';

const faqs = [
  { id: 1, question: 'How do I start a practice exam?', answer: 'Navigate to the "Practice Exams" section, select your subject, choose exam type, and click "Start Exam". You can choose between practice, timed, or mock exams. Practice exams are untimed and provide detailed explanations for each answer.' },
  { id: 2, question: 'What happens if I switch tabs during an exam?', answer: 'The system detects tab switching and will warn you. Multiple violations may lead to automatic exam submission to maintain exam integrity. For timed and mock exams, after 3 warnings, your exam will be auto-submitted.' },
  { id: 3, question: 'Can I save my progress during an exam?', answer: 'Yes! The system auto-saves every minute. You can also manually save using the "Save Progress" button in the exam interface. Your answers are saved locally even if you go offline.' },
  { id: 4, question: 'How are scores calculated?', answer: 'Scores are based on WAEC marking scheme. Objective questions are auto-graded, while essay questions follow marking guidelines with partial credit for correct steps. Your final score is displayed immediately after submission.' },
  { id: 5, question: 'Can I retake exams?', answer: 'Yes, you can retake any exam unlimited times. Your best score is recorded in your performance analytics. Each attempt helps you improve and track your progress.' },
  { id: 6, question: 'How do I view my performance?', answer: 'Go to the "Performance" section to see detailed analytics including subject performance, score trends, recent exam results, and improvement metrics. You can filter by time range (month, quarter, year).' },
  { id: 7, question: 'Is there a mobile app?', answer: 'Yes! This is a Progressive Web App (PWA). You can install it on your mobile device by adding it to your home screen for the full app experience. Open in Chrome/Safari, tap the share menu, and select "Add to Home Screen".' },
  { id: 8, question: 'How do I report an issue?', answer: 'Use the "Contact Support" form below or email us at support@einsteincbt.edu.ng. Include screenshots and details for faster resolution.' },
];

const contactMethods = [
  { type: 'Email',     address: 'support@einsteincbt.edu.ng',    response: 'Within 24 hours',       icon: Mail         },
  { type: 'Phone',     address: '+234 800 123 4567',              response: '9 AM – 5 PM (WAT)',     icon: Phone        },
  { type: 'Live Chat', address: 'Available in Support section',   response: 'Instant during hours',  icon: MessageSquare },
  { type: 'FAQ',       address: 'Check FAQs above',               response: '24/7 Self-service',     icon: HelpCircle   },
];

const guides = [
  { title: 'Quick Start Guide', description: 'Learn the basics in 5 minutes', icon: Zap,       color: 'from-brand-primary to-brand-primary-dk' },
  { title: 'Video Tutorials',   description: 'Watch step-by-step guides',      icon: Video,     color: 'from-success to-success-dark' },
  { title: 'Exam Tips',         description: 'Strategies for better scores',   icon: Lightbulb, color: 'from-purple-600 to-purple-700' },
];

export default function Help() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const { user } = useStudentAuth();

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) { toast.error('Please fill in all fields'); return; }
    setSending(true);
    const toastId = toast.loading('Sending message...');
    setTimeout(() => {
      toast.success('Message sent! Support will respond within 24 hours.', { id: toastId });
      setShowContactForm(false);
      setContactForm({ subject: '', message: '' });
      setSending(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair">Help &amp; Support</h1>
        <p className="text-sm text-content-secondary mt-1.5">Get assistance and learn how to use the platform</p>
      </div>

      {/* Guide cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {guides.map(({ title, description, icon: Icon, color }, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className={`bg-gradient-to-r ${color} rounded-xl p-5 text-white cursor-pointer`}
            onClick={() => toast.success(`Opening ${title}...`)}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Icon size={20} />
            </div>
            <h3 className="text-base font-bold mb-1 font-playfair">{title}</h3>
            <p className="text-sm opacity-90 mb-4">{description}</p>
            <button className="px-4 py-2 bg-white text-content-primary text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors min-h-[40px]">
              Learn More
            </button>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-card mb-6">
        <h2 className="text-base font-bold text-content-primary mb-5 font-playfair flex items-center gap-2">
          <HelpCircle size={16} className="text-brand-primary" /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map(faq => (
            <div key={faq.id} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-surface-muted transition-colors min-h-[52px]"
                aria-expanded={activeFaq === faq.id}
              >
                <span className="text-sm font-semibold text-content-primary pr-4">{faq.question}</span>
                <motion.div animate={{ rotate: activeFaq === faq.id ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                  <ChevronDown size={16} className="text-brand-primary" />
                </motion.div>
              </button>
              <AnimatePresence>
                {activeFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 border-t border-border bg-surface-muted">
                      <p className="text-sm text-content-secondary leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Contact + System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Contact */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <h2 className="text-base font-bold text-content-primary mb-4 font-playfair">Contact Support</h2>
          <div className="space-y-3">
            {contactMethods.map(({ type, address, response, icon: Icon }) => (
              <div key={type} className="flex items-center p-3 border border-border rounded-xl hover:bg-surface-muted transition-colors">
                <div className="w-9 h-9 bg-brand-primary-lt rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                  <Icon size={16} className="text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-content-primary">{type}</p>
                  <p className="text-xs text-content-muted truncate">{address}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs font-semibold text-success">{response}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowContactForm(true)}
            className="btn-primary w-full mt-4 text-sm"
          >
            <Headphones size={14} />
            Send Message to Support
          </button>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <h2 className="text-base font-bold text-content-primary mb-4 font-playfair">System Information</h2>
          <div className="space-y-3">
            <div className="p-4 bg-brand-primary-lt rounded-xl">
              <p className="text-xs font-semibold text-brand-primary mb-1">Current Version</p>
              <p className="text-sm font-bold text-brand-primary-dk">Einstein&apos;s CBT App v2.5.0</p>
            </div>
            <div className="p-4 bg-success-light rounded-xl">
              <p className="text-xs font-semibold text-success mb-1">Last Update</p>
              <p className="text-sm font-bold text-success">March 2026</p>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl">
              <p className="text-xs font-semibold text-content-secondary mb-1">Documentation</p>
              <p className="text-xs text-content-muted mb-2">Access detailed user guides and tutorials</p>
              <button className="text-brand-primary text-sm font-semibold hover:underline">View Documentation →</button>
            </div>
          </div>
        </div>
      </div>

      {/* PWA Install Guide */}
      <div className="bg-brand-primary-lt border border-brand-primary/20 rounded-xl p-5 mb-5">
        <h3 className="text-base font-bold text-brand-primary-dk mb-4 font-playfair flex items-center gap-2">
          <Smartphone size={16} /> Install as App (PWA)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={14} className="text-brand-primary" />
              <p className="text-sm font-semibold text-brand-primary">For Mobile:</p>
            </div>
            <ol className="space-y-2">
              {['Open in Chrome or Safari browser', 'Tap the share button (iOS) or menu (Android)', 'Select "Add to Home Screen"', 'Launch like a native app!'].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-content-secondary">
                  <span className="w-5 h-5 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Monitor size={14} className="text-brand-primary" />
              <p className="text-sm font-semibold text-brand-primary">For Desktop:</p>
            </div>
            <ol className="space-y-2">
              {['Open in Chrome or Edge browser', 'Click the install icon in address bar', 'Install as a desktop app', 'Works offline after first visit'].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-content-secondary">
                  <span className="w-5 h-5 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dk rounded-xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1 font-playfair">Need immediate assistance?</h3>
            <p className="text-sm opacity-90">Our support team is available 24/7 to help you</p>
          </div>
          <button
            onClick={() => setShowContactForm(true)}
            className="px-6 py-3 bg-white text-brand-primary font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm flex-shrink-0 min-h-[44px]"
          >
            Contact Support Now
          </button>
        </div>
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-card-lg"
            >
              <h3 className="text-lg font-bold text-content-primary mb-5 font-playfair">Contact Support</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block text-xs font-semibold text-content-primary mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-content-primary mb-1.5">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 resize-none"
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </div>
                  <div className="text-xs text-content-muted space-y-1">
                    <p>• Include screenshots if possible</p>
                    <p>• Describe steps to reproduce the issue</p>
                    <p>• Our team will respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowContactForm(false)} className="btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={sending} className="btn-primary text-sm">
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
