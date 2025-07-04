'use client'

import { useTheme } from '@/contexts/ThemeContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  const { isDarkMode } = useTheme()

  return (
    <>
      <Header />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
              Terms & Conditions
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Last updated: {new Date().toLocaleDateString('en-US')}
            </p>
          </div>

          <div className="space-y-6" style={{ color: 'var(--text-main)' }}>
            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using CallMiBro ("the Platform"), you accept and agree to be bound by these Terms and Conditions. 
                If you do not agree to abide by these terms, please do not use our services. These terms apply to all users of the platform, 
                including customers, shop owners, technicians, and service providers.
              </p>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">2. Platform Description</h2>
              <p className="mb-4">
                CallMiBro is a comprehensive device repair services platform that connects customers with repair shops, technicians, 
                and spare parts providers. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li>Device repair service bookings (mobile phones, laptops, TVs, ACs, refrigerators, etc.)</li>
                <li>Shop registration and inventory management</li>
                <li>Technician profiles and service offerings</li>
                <li>Spare parts catalog and ordering</li>
                <li>Express booking services for urgent repairs</li>
                <li>Payment processing and transaction management</li>
                <li>Customer support and dispute resolution</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">3. Service Booking Terms</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Booking Process</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Customers must provide accurate device information, contact details, and service requirements</li>
                    <li>Bookings are confirmed based on technician availability and service area coverage</li>
                    <li>Express bookings are subject to additional fees and availability</li>
                    <li>Service prices may vary based on device model, repair complexity, and location</li>
                    <li>All bookings are subject to technician approval and confirmation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Cancellation Policy</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Cancellations must be made at least 24 hours before scheduled appointment</li>
                    <li>Late cancellations may incur charges up to 50% of service fee</li>
                    <li>No-shows will be charged the full service fee</li>
                    <li>Technicians may cancel due to emergencies or technical issues</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">4. Shop Owner Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide accurate and truthful information about your shop, services, and qualifications</li>
                <li>Maintain up-to-date inventory information with accurate pricing and availability</li>
                <li>Respond to customer inquiries and booking requests within 24 hours</li>
                <li>Maintain professional conduct and provide quality service as advertised</li>
                <li>Comply with all applicable laws, regulations, and industry standards</li>
                <li>Keep contact information, business hours, and service areas current</li>
                <li>Honor all confirmed bookings and appointments made through the platform</li>
                <li>Provide warranty information and after-service support as promised</li>
                <li>Maintain proper insurance coverage for business operations</li>
                <li>Ensure all technicians are qualified and properly trained</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">5. Customer Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide accurate device information, including model, serial number, and issue description</li>
                <li>Arrive on time for scheduled appointments or notify of delays</li>
                <li>Treat shop staff, technicians, and premises with respect and courtesy</li>
                <li>Pay for services as agreed upon before or after service completion</li>
                <li>Provide honest feedback about services received</li>
                <li>Back up important data before any repair service</li>
                <li>Remove personal items and accessories before service</li>
                <li>Follow safety instructions provided by technicians</li>
                <li>Report any issues or concerns immediately after service</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">6. Payment and Pricing</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Service Pricing</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Service prices are set by individual shops and technicians</li>
                    <li>Prices may vary based on device model, repair complexity, and location</li>
                    <li>Additional charges may apply for parts, diagnostics, or emergency services</li>
                    <li>All prices are displayed in Indian Rupees (₹) and are inclusive of applicable taxes</li>
                    <li>Express booking services may incur additional fees</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Payment Methods</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Online payment through secure payment gateways</li>
                    <li>Cash payment at service location (subject to shop acceptance)</li>
                    <li>Digital wallets and UPI payments</li>
                    <li>Payment plans may be available for high-value repairs</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Refund Policy</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Refunds are processed within 5-7 business days</li>
                    <li>Service fees are non-refundable once service is completed</li>
                    <li>Parts and materials charges are non-refundable unless defective</li>
                    <li>Platform fees are non-refundable for completed transactions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">7. Warranty and Service Guarantee</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Service Warranty</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>All repairs come with a minimum 30-day service warranty</li>
                    <li>Warranty covers workmanship and installed parts</li>
                    <li>Warranty does not cover new damage or unrelated issues</li>
                    <li>Extended warranty options may be available for additional cost</li>
                    <li>Warranty is void if device is opened by unauthorized personnel</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Data Protection</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Customers are responsible for backing up their data before service</li>
                    <li>Shops are not liable for data loss during repair process</li>
                    <li>Data recovery services may be available at additional cost</li>
                    <li>Customers should remove sensitive data before service</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">8. Platform Rules and Prohibited Activities</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>No spam, harassment, or inappropriate behavior towards other users</li>
                <li>No false or misleading information about services, prices, or qualifications</li>
                <li>No unauthorized use of the platform or attempts to circumvent security</li>
                <li>No posting of inappropriate content, including offensive language or images</li>
                <li>No attempts to manipulate reviews, ratings, or feedback systems</li>
                <li>No commercial use of the platform without proper authorization</li>
                <li>Respect intellectual property rights and copyright laws</li>
                <li>Follow all applicable laws and regulations in your jurisdiction</li>
                <li>No sharing of personal information of other users without consent</li>
                <li>No attempts to gain unauthorized access to platform systems or data</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">9. Account Management</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>CallMiBro reserves the right to suspend or terminate accounts for violations</li>
                <li>You can update or delete your information at any time through your account settings</li>
                <li>Account termination may result in loss of data, booking history, and access to services</li>
                <li>Multiple accounts for the same business are not permitted without approval</li>
                <li>Account sharing is prohibited and may result in suspension</li>
                <li>Inactive accounts may be deactivated after 12 months of inactivity</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">10. Dispute Resolution</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Customer-Service Provider Disputes</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>CallMiBro acts as a facilitator and is not responsible for service quality disputes</li>
                    <li>We encourage direct communication between customers and service providers</li>
                    <li>Our support team can assist with platform-related issues and mediation</li>
                    <li>Legal disputes should be resolved through appropriate legal channels</li>
                    <li>We may provide evidence and documentation to assist in dispute resolution</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Platform Disputes</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Disputes with CallMiBro will be resolved through customer support channels</li>
                    <li>Unresolved disputes may be escalated to management</li>
                    <li>Legal disputes with CallMiBro are subject to Indian law and jurisdiction</li>
                    <li>Alternative dispute resolution methods may be used when appropriate</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">11. Limitation of Liability</h2>
              <p className="mb-4">
                CallMiBro is not liable for any damages arising from the use of our platform, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li>Service quality issues or unsatisfactory repairs</li>
                <li>Data loss during repair processes</li>
                <li>Business interruptions or technical failures</li>
                <li>Disputes between customers and service providers</li>
                <li>Third-party actions or negligence</li>
                <li>Force majeure events beyond our control</li>
                <li>Indirect, incidental, or consequential damages</li>
              </ul>
              <p className="mt-4">
                Our total liability is limited to the amount paid for the specific service in dispute.
              </p>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">12. Intellectual Property</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>CallMiBro retains all rights to platform design, code, and proprietary technology</li>
                <li>Users retain rights to their content, reviews, and business information</li>
                <li>Sharing of platform content requires written permission</li>
                <li>Reverse engineering or copying of platform features is prohibited</li>
                <li>CallMiBro logo and branding are protected trademarks</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">13. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes 
                via email or platform notification. Continued use of the platform after changes constitutes acceptance 
                of the new terms. Material changes will be communicated at least 30 days in advance.
              </p>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">14. Governing Law</h2>
              <p className="mb-4">
                These terms are governed by the laws of India. Any disputes arising from these terms or use of the platform 
                will be subject to the exclusive jurisdiction of courts in Faridabad, Haryana, India.
              </p>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">15. Contact Information</h2>
              <p className="mb-4">
                For questions about these terms, please contact us at:
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Email: support@callmibro.com<br />
                Phone: +91-9354156323<br />
                Address: Faridabad, Haryana, India<br />
                Business Hours: Monday - Sunday, 8:00 AM - 8:00 PM IST
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
} 