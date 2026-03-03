// components/dashboard-content/Help.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';

export default function Help() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const { user } = useStudentAuth();

  const faqs = [
    { 
      id: 1, 
      question: 'How do I start a practice exam?', 
      answer: 'Navigate to the "Practice Exams" section, select your subject, choose exam type, and click "Start Exam". You can choose between practice, timed, or mock exams. Practice exams are untimed and provide detailed explanations for each answer.'
    },
    { 
      id: 2, 
      question: 'What happens if I switch tabs during an exam?', 
      answer: 'The system detects tab switching and will warn you. Multiple violations may lead to automatic exam submission to maintain exam integrity. For timed and mock exams, after 3 warnings, your exam will be auto-submitted.'
    },
    { 
      id: 3, 
      question: 'Can I save my progress during an exam?', 
      answer: 'Yes! The system auto-saves every minute. You can also manually save using the "Save Progress" button in the exam interface. Your answers are saved locally even if you go offline.'
    },
    { 
      id: 4, 
      question: 'How are scores calculated?', 
      answer: 'Scores are based on WAEC marking scheme. Objective questions are auto-graded, while essay questions follow marking guidelines with partial credit for correct steps. Your final score is displayed immediately after submission.'
    },
    { 
      id: 5, 
      question: 'Can I retake exams?', 
      answer: 'Yes, you can retake any exam unlimited times. Your best score is recorded in your performance analytics. Each attempt helps you improve and track your progress.'
    },
    { 
      id: 6, 
      question: 'How do I view my performance?', 
      answer: 'Go to the "Performance" section to see detailed analytics including subject performance, score trends, recent exam results, and improvement metrics. You can filter by time range (month, quarter, year).'
    },
    { 
      id: 7, 
      question: 'Is there a mobile app?', 
      answer: 'Yes! This is a Progressive Web App (PWA). You can install it on your mobile device by adding it to your home screen for full app experience. Open in Chrome/Safari, tap share menu, and select "Add to Home Screen".'
    },
    { 
      id: 8, 
      question: 'How do I report an issue?', 
      answer: 'Use the "Contact Support" form below or email support at support@waecsimulator.edu.ng. Include screenshots and details for faster resolution. You can also create a support ticket from the Support section.'
    },
  ];

  const contactMethods = [
    { type: 'Email', address: 'support@waecsimulator.edu.ng', response: 'Within 24 hours', icon: '📧' },
    { type: 'Phone', address: '+234 800 123 4567', response: '9 AM - 5 PM (WAT)', icon: '📞' },
    { type: 'Live Chat', address: 'Available in Support section', response: 'Instant during hours', icon: '💬' },
    { type: 'FAQ', address: 'Check FAQs above', response: '24/7 Self-service', icon: '📚' },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    const toastId = toast.loading('Sending message...');

    setTimeout(() => {
      toast.success('Message sent successfully! Support will respond within 24 hours.', { id: toastId });
      setShowContactForm(false);
      setContactForm({ subject: '', message: '' });
      setSending(false);
    }, 1500);
  };

  const handleDownloadGuide = (guideName) => {
    toast.success(`Downloading ${guideName}...`);
  };

  const guides = [
    {
      title: 'Quick Start Guide',
      description: 'Learn the basics in 5 minutes',
      icon: '🚀',
      color: 'from-blue-600 to-blue-500',
      link: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      icon: '🎥',
      color: 'from-green-600 to-green-500',
      link: '#'
    },
    {
      title: 'Exam Tips',
      description: 'Strategies for better scores',
      icon: '💡',
      color: 'from-purple-600 to-purple-500',
      link: '#'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">Help & Support</h1>
        <p className="text-[#626060] mt-2 font-playfair">Get assistance and learn how to use the platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {guides.map((guide, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`bg-gradient-to-r ${guide.color} rounded-xl p-6 text-white cursor-pointer`}
            onClick={() => handleDownloadGuide(guide.title)}
          >
            <div className="text-4xl mb-4">{guide.icon}</div>
            <h3 className="text-xl font-bold mb-2 font-playfair">{guide.title}</h3>
            <p className="text-white/90 mb-4 font-playfair">{guide.description}</p>
            <button className="px-4 py-2 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition font-playfair">
              Learn More →
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-[#1E1E1E] mb-6 font-playfair">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[#1E1E1E] font-playfair">{faq.question}</span>
                <span className="text-[#039994] text-xl">{activeFaq === faq.id ? '−' : '+'}</span>
              </button>
              {activeFaq === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border-t border-gray-200 bg-gray-50"
                >
                  <p className="text-[#626060] font-playfair">{faq.answer}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-6 font-playfair">Contact Support</h2>
          <div className="space-y-4">
            {contactMethods.map((method, index) => (
              <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="text-2xl mr-4">{method.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-[#1E1E1E] font-playfair">{method.type}</div>
                  <div className="text-sm text-[#626060] font-playfair">{method.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#9CA3AF] font-playfair">Response:</div>
                  <div className="text-sm font-medium text-[#039994] font-playfair">{method.response}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowContactForm(true)}
            className="mt-6 w-full py-3 bg-[#039994] text-white font-medium rounded-lg hover:bg-[#02857f] transition font-playfair"
          >
            Send Message to Support
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-6 font-playfair">System Information</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2 font-playfair">Current Version</h3>
              <p className="text-sm text-blue-600 font-playfair">WAEC CBT Simulator v2.5.0</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2 font-playfair">Last Update</h3>
              <p className="text-sm text-green-600 font-playfair">March 2026</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2 font-playfair">Documentation</h3>
              <p className="text-sm text-purple-600 mb-2 font-playfair">Access detailed user guides and tutorials</p>
              <button className="text-purple-700 text-sm font-medium hover:underline font-playfair">
                View Documentation →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-[#039994] to-[#02857f] rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold mb-2 font-playfair">Need immediate assistance?</h3>
            <p className="text-white/90 font-playfair">Our support team is available 24/7 to help you</p>
          </div>
          <button
            onClick={() => setShowContactForm(true)}
            className="px-8 py-3 bg-white text-[#039994] font-bold rounded-lg hover:bg-gray-100 transition font-playfair"
          >
            Contact Support Now
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-[#1E1E1E] mb-4 font-playfair">Contact Support</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2 font-playfair">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#039994] focus:border-[#039994] font-playfair"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2 font-playfair">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#039994] focus:border-[#039994] font-playfair"
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </div>
                  <div className="text-xs text-[#626060] font-playfair">
                    <p>• Include screenshots if possible</p>
                    <p>• Describe steps to reproduce the issue</p>
                    <p>• Our team will respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-[13px] font-playfair"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className={`px-6 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] text-[13px] font-playfair ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 font-playfair">📱 PWA Installation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-700 mb-2 font-playfair">For Mobile:</h4>
            <ul className="space-y-2 text-sm text-blue-600">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Open in Chrome/Safari browser</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Tap the share button (iOS) or menu (Android)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Select "Add to Home Screen"</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Launch like a native app!</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2 font-playfair">For Desktop:</h4>
            <ul className="space-y-2 text-sm text-blue-600">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Open in Chrome/Edge browser</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Click the install icon in address bar</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Install as desktop app</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Works offline after first visit</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}