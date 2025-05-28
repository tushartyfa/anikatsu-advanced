'use client';

import SharedLayout from '@/components/SharedLayout';

export default function TermsPage() {
  return (
    <SharedLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service & Privacy Policy</h1>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Terms of Service</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white">1. Acceptance of Terms</h3>
                <p className="text-gray-400">
                  By accessing and using JustAnime, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
                  If you do not agree with any part of these terms, you may not use our services.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">2. Service Description</h3>
                <p className="text-gray-400">
                  JustAnime is a platform that provides information and links to anime content. 
                  We do not host, upload, or distribute any content directly. 
                  Our service aggregates links to third-party websites and services that host the actual content.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">3. User Conduct</h3>
                <p className="text-gray-400">
                  Users of JustAnime agree not to:
                </p>
                <ul className="text-gray-400 list-disc pl-6 space-y-2 mt-2">
                  <li>Use our service for any illegal purpose or in violation of any local, state, national, or international law</li>
                  <li>Harass, abuse, or harm another person</li>
                  <li>Interfere with or disrupt the service or servers connected to the service</li>
                  <li>Create multiple accounts for disruptive or abusive purposes</li>
                  <li>Attempt to access any portion of the service that you are not authorized to access</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">4. Content Disclaimer</h3>
                <p className="text-gray-400">
                  JustAnime does not host any content on its servers. We are not responsible for the content, accuracy, or practices of third-party websites that our service may link to. 
                  These links are provided solely as a convenience to users, and we do not endorse the content of such third-party sites.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">5. Intellectual Property</h3>
                <p className="text-gray-400">
                  All trademarks, logos, service marks, and trade names are the property of their respective owners. 
                  JustAnime respects intellectual property rights and expects users to do the same. 
                  If you believe content linked through our service infringes on your copyright, please contact us with details.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">6. Modification of Terms</h3>
                <p className="text-gray-400">
                  JustAnime reserves the right to modify these Terms of Service at any time. 
                  We will provide notice of significant changes through our website. 
                  Your continued use of our service after such modifications constitutes your acceptance of the updated terms.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">7. Termination</h3>
                <p className="text-gray-400">
                  JustAnime reserves the right to terminate or suspend your access to our service at any time, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms of Service.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Privacy Policy</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white">1. Information We Collect</h3>
                <p className="text-gray-400">
                  JustAnime collects the following types of information:
                </p>
                <ul className="text-gray-400 list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Information you provide:</strong> We may collect personal information such as your email address when you sign up for an account or contact us.</li>
                  <li><strong>Usage data:</strong> We automatically collect information about your interactions with our service, including the pages you visit and your preferences.</li>
                  <li><strong>Device information:</strong> We collect information about your device and internet connection, including IP address, browser type, and operating system.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">2. How We Use Your Information</h3>
                <p className="text-gray-400">
                  We use the information we collect to:
                </p>
                <ul className="text-gray-400 list-disc pl-6 space-y-2 mt-2">
                  <li>Provide, maintain, and improve our service</li>
                  <li>Communicate with you about updates, support, and features</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                  <li>Protect against, identify, and prevent fraud and other illegal activity</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">3. Cookies and Similar Technologies</h3>
                <p className="text-gray-400">
                  JustAnime uses cookies and similar tracking technologies to track activity on our service and hold certain information. 
                  Cookies are files with a small amount of data that may include an anonymous unique identifier. 
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">4. Data Sharing and Disclosure</h3>
                <p className="text-gray-400">
                  We may share your information in the following circumstances:
                </p>
                <ul className="text-gray-400 list-disc pl-6 space-y-2 mt-2">
                  <li>With service providers who perform services on our behalf</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect the rights, property, or safety of JustAnime, our users, or others</li>
                  <li>In connection with a business transfer, such as a merger or acquisition</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">5. Data Security</h3>
                <p className="text-gray-400">
                  JustAnime takes reasonable measures to protect your information from unauthorized access, alteration, disclosure, or destruction. 
                  However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">6. Your Rights</h3>
                <p className="text-gray-400">
                  Depending on your location, you may have certain rights regarding your personal data, including:
                </p>
                <ul className="text-gray-400 list-disc pl-6 space-y-2 mt-2">
                  <li>The right to access and receive a copy of your data</li>
                  <li>The right to rectify or update your data</li>
                  <li>The right to delete your data</li>
                  <li>The right to restrict processing of your data</li>
                  <li>The right to object to processing of your data</li>
                  <li>The right to data portability</li>
                </ul>
                <p className="text-gray-400 mt-2">
                  To exercise these rights, please contact us at privacy@justanime.com.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">7. Children's Privacy</h3>
                <p className="text-gray-400">
                  JustAnime does not knowingly collect personal information from children under 13. 
                  If you are a parent or guardian and you believe your child has provided us with personal information, please contact us.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">8. Changes to This Privacy Policy</h3>
                <p className="text-gray-400">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">9. Contact Us</h3>
                <p className="text-gray-400">
                  If you have any questions about this Privacy Policy, please contact us at privacy@justanime.com.
                </p>
              </div>
              
              <div className="pt-6">
                <p className="text-gray-500">Last Updated: May 5, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
} 