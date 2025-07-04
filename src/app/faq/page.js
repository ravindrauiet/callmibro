'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { FiSearch, FiPlus, FiMinus } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

// Fallback FAQ data in case Firebase fails
const fallbackFaqs = [
  {
    id: '1',
    question: 'What services does CallMiBro offer?',
    answer: 'CallMiBro offers a wide range of repair services including mobile screen repair, TV diagnostics, AC gas refill, battery replacement, speaker repair, and many more. We also provide spare parts for various electronic devices.'
  },
  {
    id: '2',
    question: 'How can I book a service?',
    answer: 'You can book a service through our website by selecting the service you need, choosing a technician, scheduling a convenient time, and providing your address. You can also call our customer service number for assistance with booking.'
  },
  {
    id: '3',
    question: 'What areas do you service?',
    answer: 'Currently, we provide services in major cities across India including Mumbai, Delhi, Bangalore, Chennai, and Pune. We\'re constantly expanding our coverage, so please check our website for the most up-to-date information.'
  },
  {
    id: '4',
    question: 'How are your technicians vetted?',
    answer: 'All our technicians undergo a rigorous background check and must pass our technical certification program. They are experts in their respective fields with years of experience in repair and maintenance.'
  },
  {
    id: '5',
    question: 'Do you offer any warranty on repairs?',
    answer: 'Yes, we offer a 30-day warranty on all repairs. If you face any issues with our service within this period, we\'ll fix it at no additional cost. Certain repairs may come with extended warranty options.'
  },
  {
    id: '6',
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery. All online payments are secured with industry-standard encryption.'
  },
  {
    id: '7',
    question: 'How can I track my service request?',
    answer: 'Once you book a service, you\'ll receive a unique order ID. You can use this ID to track your service status through our website or app. We also send regular SMS and email updates about your service status.'
  }
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    async function fetchFaqs() {
      try {
        setLoading(true);
        const faqsRef = collection(db, 'faqs');
        const q = query(faqsRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // If no FAQs found in Firebase, use fallback data
          setFaqs(fallbackFaqs);
        } else {
          const faqsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setFaqs(faqsData);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        // Fallback to mock data on error
        setFaqs(fallbackFaqs);
      } finally {
        setLoading(false);
      }
    }

    fetchFaqs();
  }, []);

  const toggleFaq = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter FAQs based on search query
  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Hero Banner */}
      <div style={{ backgroundColor: 'var(--panel-charcoal)' }} className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Got questions? We've got answers.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search FAQs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md py-3 px-4 pl-12 focus:outline-none focus:border-red-500"
              style={{ 
                backgroundColor: 'var(--bg-main)', 
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }} className="absolute left-4 top-3.5">
              <FiSearch size={20} />
            </span>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
          {loading ? (
            <div className="py-16 text-center">
              <p style={{ color: 'var(--text-secondary)' }}>Loading FAQs...</p>
            </div>
          ) : filteredFaqs.length > 0 ? (
            <div style={{ borderTop: '1px solid var(--border-color)' }}>
              {filteredFaqs.map((faq) => (
                <div key={faq.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="last:border-b-0">
                  <button
                    className="flex justify-between items-center w-full text-left py-5 px-6 transition-colors"
                    onClick={() => toggleFaq(faq.id)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span className="font-medium text-lg pr-8">{faq.question}</span>
                    <span className={`text-red-500 transition-transform ${expandedId === faq.id ? 'transform rotate-180' : ''}`}>
                      {expandedId === faq.id ? <FiMinus size={20} /> : <FiPlus size={20} />}
                    </span>
                  </button>
                  {expandedId === faq.id && (
                    <div style={{ backgroundColor: 'var(--bg-main)' }} className="py-4 px-6">
                      <p style={{ color: 'var(--text-secondary)' }}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p style={{ color: 'var(--text-secondary)' }}>No FAQs found matching your search</p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-red-500 hover:text-red-400"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Still have questions */}
        <div className="mt-12 rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
          <h2 className="text-2xl font-semibold mb-4">Can't find what you're looking for?</h2>
          <p style={{ color: 'var(--text-secondary)' }} className="mb-6">Our support team is ready to help you with any questions you may have.</p>
          <a href="/contact" className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-md transition-colors inline-block">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
} 