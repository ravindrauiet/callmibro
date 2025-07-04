'use client'

import { useTheme } from '@/contexts/ThemeContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  const { isDarkMode } = useTheme()

  return (
    <>
      <Header />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
              Privacy Policy
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Last updated: {new Date().toLocaleDateString('en-US')}
            </p>
          </div>

          <div className="space-y-6" style={{ color: 'var(--text-main)' }}>
            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Name, email address, and phone number for account creation and communication</li>
                    <li>Shop details including business name, address, contact information, and service areas</li>
                    <li>Technician information including qualifications, specializations, and service history</li>
                    <li>Device information including model, serial number, and repair requirements</li>
                    <li>Location data (with your explicit consent) for service area matching</li>
                    <li>Payment information (processed securely through third-party payment gateways)</li>
                    <li>Profile pictures and business images for shop and technician profiles</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Service-Related Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Booking details including service type, device information, and appointment schedules</li>
                    <li>Service history and repair records for quality assurance</li>
                    <li>Customer feedback, reviews, and ratings</li>
                    <li>Communication records between customers and service providers</li>
                    <li>Inventory management data for shop owners</li>
                    <li>Payment transaction records and billing information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Technical Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Device information including IP address, browser type, and operating system</li>
                    <li>Usage patterns, preferences, and platform interaction data</li>
                    <li>App performance data and error logs for platform improvement</li>
                    <li>Network information and connection quality data</li>
                    <li>Cookies and similar tracking technologies usage</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Service Provision</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Facilitate bookings and connect customers with appropriate service providers</li>
                    <li>Process payments and manage financial transactions</li>
                    <li>Send service-related notifications and appointment reminders</li>
                    <li>Provide customer support and handle inquiries</li>
                    <li>Manage shop inventory and spare parts catalog</li>
                    <li>Enable communication between customers and service providers</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Platform Improvement</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Analyze usage patterns to improve platform functionality and user experience</li>
                    <li>Develop new features and services based on user needs</li>
                    <li>Conduct research and analytics for business insights</li>
                    <li>Optimize platform performance and security</li>
                    <li>Personalize content and recommendations</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Security and Compliance</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Ensure platform security and prevent fraud or abuse</li>
                    <li>Verify user identities and maintain account security</li>
                    <li>Comply with legal obligations and regulatory requirements</li>
                    <li>Investigate and resolve disputes or complaints</li>
                    <li>Maintain service quality standards and professional conduct</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">3. Information Sharing</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">With Service Providers</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Shop information is shared with customers for booking and service delivery</li>
                    <li>Customer contact details are shared with shops for appointment coordination</li>
                    <li>Device information is shared with technicians for repair assessment</li>
                    <li>Location data helps customers find nearby service providers</li>
                    <li>Payment information is shared with payment processors for transaction processing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">With Third-Party Services</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Payment gateways for secure transaction processing</li>
                    <li>Cloud hosting providers for data storage and platform hosting</li>
                    <li>Analytics services to understand platform usage and improve services</li>
                    <li>Customer support tools for efficient service delivery</li>
                    <li>Email and SMS services for communication</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Legal Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>We may share information when required by law or legal process</li>
                    <li>Information may be shared to protect our rights, property, or safety</li>
                    <li>Data may be shared in emergency situations or to prevent harm</li>
                    <li>We do not sell, rent, or trade your personal information for marketing purposes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We use industry-standard encryption (SSL/TLS) to protect data in transit</li>
                <li>Secure servers with regular security audits and vulnerability assessments</li>
                <li>Limited access to personal information by authorized staff only</li>
                <li>Regular backups to prevent data loss and ensure business continuity</li>
                <li>Continuous monitoring for suspicious activities and potential threats</li>
                <li>Multi-factor authentication for sensitive account operations</li>
                <li>Regular security training for our staff and contractors</li>
                <li>Compliance with data protection regulations and industry standards</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">5. Your Rights and Choices</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Access and Control</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Access your personal information through your account settings</li>
                    <li>Update or correct your information at any time</li>
                    <li>Delete your account and associated data (with some limitations)</li>
                    <li>Export your data in a portable format</li>
                    <li>Request information about how your data is processed</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Communication Preferences</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Opt out of marketing communications while keeping service notifications</li>
                    <li>Control email and SMS notification preferences</li>
                    <li>Manage push notification settings in your device</li>
                    <li>Choose what information is shared with other users</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Data Processing</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Withdraw consent for data processing (where applicable)</li>
                    <li>Request restriction of data processing in certain circumstances</li>
                    <li>Object to processing of your data for specific purposes</li>
                    <li>Request data portability to other services</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">6. Location Services</h2>
              <div className="space-y-4">
                <p>
                  We collect location data to help customers find nearby service providers and for service delivery purposes.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Location is only collected with your explicit consent</li>
                  <li>You can disable location services at any time through your device settings</li>
                  <li>Location data is used only for service-related purposes</li>
                  <li>We do not track your location continuously or without your knowledge</li>
                  <li>Location data helps match you with service providers in your area</li>
                  <li>Service providers can see your general location for service area verification</li>
                  <li>Location data is not shared with third parties for marketing purposes</li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
              <div className="space-y-4">
                <p>
                  We use cookies and similar technologies to improve your experience on our platform.
                </p>
                <div>
                  <h3 className="font-medium mb-2">Types of Cookies We Use</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>Essential cookies for platform functionality and security</li>
                    <li>Analytics cookies to understand usage patterns and improve services</li>
                    <li>Preference cookies to remember your settings and choices</li>
                    <li>Session cookies to maintain your login status during browsing</li>
                    <li>Performance cookies to optimize platform speed and reliability</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Cookie Management</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>You can control cookie settings in your browser preferences</li>
                    <li>Disabling certain cookies may affect platform functionality</li>
                    <li>We respect Do Not Track signals from your browser</li>
                    <li>Third-party cookies are used only for essential services</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">8. Data Retention</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We retain your data as long as your account is active and for service provision</li>
                <li>Account data is deleted within 30 days of account deletion request</li>
                <li>Service records are retained for 3 years for warranty and quality assurance</li>
                <li>Payment records are retained for 7 years for tax and legal compliance</li>
                <li>Some data may be retained longer for legal compliance or dispute resolution</li>
                <li>Backup data is automatically deleted after 90 days</li>
                <li>Anonymized data may be retained indefinitely for analytics and research</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">9. International Data Transfers</h2>
              <div className="space-y-4">
                <p>
                  Your data may be processed in countries other than India where our service providers are located.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>We ensure adequate data protection measures are in place</li>
                  <li>Data transfers comply with applicable data protection laws</li>
                  <li>Service providers are bound by contractual data protection obligations</li>
                  <li>We monitor and audit international data processing activities</li>
                  <li>You will be notified of any significant changes to data transfer practices</li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">10. Children's Privacy</h2>
              <p>
                Our platform is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If we become aware that we have collected such information, 
                we will take steps to delete it promptly. Parents or guardians who believe their child has provided 
                us with personal information should contact us immediately.
              </p>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">11. Third-Party Services</h2>
              <div className="space-y-4">
                <p>
                  Our platform may contain links to third-party websites or integrate with third-party services.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>We are not responsible for the privacy practices of third-party services</li>
                  <li>Third-party services have their own privacy policies and terms of service</li>
                  <li>We recommend reviewing privacy policies of third-party services you use</li>
                  <li>We limit data sharing with third parties to what is necessary for service provision</li>
                  <li>Third-party integrations are regularly reviewed for security and privacy compliance</li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">12. Data Breach Notification</h2>
              <div className="space-y-4">
                <p>
                  In the event of a data breach that affects your personal information, we will:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Notify affected users within 72 hours of discovering the breach</li>
                  <li>Provide information about the nature and scope of the breach</li>
                  <li>Outline steps we are taking to address the situation</li>
                  <li>Recommend actions you can take to protect your information</li>
                  <li>Report the breach to relevant authorities as required by law</li>
                  <li>Cooperate with law enforcement in breach investigations</li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">13. Changes to Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors. We will notify you of any significant changes 
                via email or platform notification at least 30 days before the changes take effect. 
                Continued use of the platform after changes constitutes acceptance of the updated privacy policy.
              </p>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h2 className="text-xl font-semibold mb-4">14. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this privacy policy or our data practices, please contact us:
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Email: privacy@callmibro.com<br />
                Phone: +91-9354156323<br />
                Address: Faridabad, Haryana, India<br />
                Business Hours: Monday - Sunday, 8:00 AM - 8:00 PM IST<br />
                Data Protection Officer: dpo@callmibro.com
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
} 