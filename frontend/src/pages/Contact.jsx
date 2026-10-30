import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, Clock } from 'lucide-react';
import { contactApi } from '../services/api';
import { generateWhatsAppLink } from '../utils/formatCurrency';
import Button from '../components/ui/Button';
import SEO from '../components/seo/SEO';

const WHATSAPP_NUMBER = '254705090920';
const PHONE_NUMBER = '+254 705 090 920';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await contactApi.submit(formData);
      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div><SEO
  title="Contact Us"
  description="Get in touch with AfryStride Sportswear. Order via WhatsApp, call us, or visit our store in Nairobi. We're here to help with your sportswear needs."
  url="https://afrystride.co.ke/contact"
  />
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#0A0A0A] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">GET IN TOUCH</h1>
          <p className="text-gray-300">We're here to help with your orders and inquiries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <a
            href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}
            className="flex items-center gap-4 p-6 bg-[#F5F5F5] hover:bg-[#0A0A0A] hover:text-white transition-colors group"
          >
            <Phone className="w-8 h-8 text-[#E31E24] group-hover:text-[#E31E24]" />
            <div>
              <p className="font-bold">Call Us</p>
              <p className="text-sm text-[#9CA3AF] group-hover:text-gray-300">{PHONE_NUMBER}</p>
            </div>
          </a>
          <a
            href={generateWhatsAppLink(WHATSAPP_NUMBER, 'Hi AfryStride! I have a question.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 bg-[#F5F5F5] hover:bg-[#0A0A0A] hover:text-white transition-colors group"
          >
            <MessageCircle className="w-8 h-8 text-[#E31E24] group-hover:text-[#E31E24]" />
            <div>
              <p className="font-bold">WhatsApp</p>
              <p className="text-sm text-[#9CA3AF] group-hover:text-gray-300">Quick Response</p>
            </div>
          </a>
          <div className="flex items-center gap-4 p-6 bg-[#F5F5F5]">
            <Clock className="w-8 h-8 text-[#E31E24]" />
            <div>
              <p className="font-bold">Business Hours</p>
              <p className="text-sm text-[#9CA3AF]">Mon-Sat: 8AM - 6PM</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            {submitted ? (
              <div className="bg-[#1E8E3E]/10 border border-[#1E8E3E] p-6 text-center">
                <p className="text-[#1E8E3E] font-bold text-lg mb-2">Message Sent!</p>
                <p className="text-[#0A0A0A]">We'll get back to you as soon as possible.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-[#E31E24] font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                    placeholder="07XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                {error && <p className="text-[#E31E24] text-sm">{error}</p>}
                <Button type="submit" fullWidth disabled={submitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

          {/* Map & Address */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Visit Our Store</h2>
            <div className="aspect-video bg-[#F5F5F5] mb-6">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.819917631083!2d36.824407075736!3d-1.287307998700696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMTcnMTQuMyJTIDM2wrA0OSczNy4xIkU!5e0!3m2!1sen!2ske!4v1751470380000!5m2!1sen!2ske"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title="AfryStride Store Location"
  />
</div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E31E24] mt-0.5" />
                <div>
                  <p className="font-medium">AfryStride Sportswear</p>
                  <p className="text-[#9CA3AF] text-sm">Nairobi, Kenya</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#E31E24]" />
                <a href="mailto:info@afrystride.co.ke" className="text-sm hover:text-[#E31E24]">info@afrystride.co.ke</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}