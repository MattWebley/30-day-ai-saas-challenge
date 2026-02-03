import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </Link>

        <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 md:p-12 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
            <p className="text-slate-500">Last Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">1. INTRODUCTION</h2>
              <p className="text-slate-700">
                <strong>Webley Global - FZCO</strong> ("Company," "we," "us," or "our"), a Free Zone Company registered in Dubai, United Arab Emirates, respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the 21-Day AI SaaS Challenge platform and related services (the "Services").
              </p>
              <p className="text-slate-700">
                By accessing or using our Services, you consent to the practices described in this Privacy Policy. If you do not agree with this policy, please do not use our Services.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700">
                <p><strong>Data Controller:</strong></p>
                <p>Webley Global - FZCO</p>
                <p>Building A1, Dubai Digital Park</p>
                <p>Dubai Silicon Oasis, IFZA Business Park, DDP</p>
                <p>Dubai, United Arab Emirates</p>
                <p className="mt-2">Email: matt@mattwebley.com</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">2. INFORMATION WE COLLECT</h2>

              <h3 className="text-lg font-bold text-slate-800">2.1 Information You Provide Directly</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password, profile picture</li>
                <li><strong>Payment Information:</strong> Billing address, payment card details (processed securely by our payment processor, Stripe)</li>
                <li><strong>Communications:</strong> Messages, feedback, support requests, survey responses</li>
                <li><strong>User Content:</strong> Project information, ideas, code, and other content you submit through the Services</li>
                <li><strong>Coaching Sessions:</strong> Information shared during coaching calls, notes, and session recordings (if applicable)</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns, course progress</li>
                <li><strong>Cookies and Tracking:</strong> Cookies, pixels, web beacons, and similar technologies</li>
                <li><strong>Log Data:</strong> Access times, error logs, referring URLs</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Authentication Providers:</strong> If you sign in via Google, GitHub, or other providers, we receive basic profile information</li>
                <li><strong>Payment Processors:</strong> Transaction confirmations and fraud prevention data from Stripe</li>
                <li><strong>Analytics Providers:</strong> Aggregated usage data from analytics services</li>
                <li><strong>Advertising Partners:</strong> Information about ad interactions (Facebook, Google)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">3. HOW WE USE YOUR INFORMATION</h2>
              <p className="text-slate-700">We use collected information for the following purposes:</p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve our Services</li>
                <li><strong>Account Management:</strong> To create and manage your account, process transactions</li>
                <li><strong>Communications:</strong> To send important updates, newsletters, marketing materials, and respond to inquiries</li>
                <li><strong>Personalization:</strong> To customize your experience and provide relevant content</li>
                <li><strong>Analytics:</strong> To understand how users interact with our Services and improve them</li>
                <li><strong>Security:</strong> To detect, prevent, and address fraud, abuse, and security issues</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                <li><strong>Marketing:</strong> To deliver targeted advertising and measure campaign effectiveness</li>
                <li><strong>Business Operations:</strong> For internal operations, research, and development</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">4. LEGAL BASIS FOR PROCESSING (GDPR/UK GDPR)</h2>
              <p className="text-slate-700">For users in the European Economic Area (EEA) and United Kingdom, we process personal data based on:</p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Contract Performance:</strong> Processing necessary to fulfill our agreement with you</li>
                <li><strong>Legitimate Interests:</strong> Processing for our legitimate business interests (analytics, security, marketing) where not overridden by your rights</li>
                <li><strong>Consent:</strong> Where you have given explicit consent for specific processing activities</li>
                <li><strong>Legal Obligation:</strong> Processing required to comply with applicable laws</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">5. COOKIES AND TRACKING TECHNOLOGIES</h2>
              <p className="text-slate-700">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Keep you logged in and remember your preferences</li>
                <li>Analyze site traffic and user behavior</li>
                <li>Deliver and measure advertising effectiveness</li>
                <li>Provide social media features</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800">Types of Cookies We Use:</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic site functionality (authentication, security)</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign performance</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              </ul>

              <p className="text-slate-700">
                <strong>Managing Cookies:</strong> You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our Services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">6. SHARING AND DISCLOSURE</h2>
              <p className="text-slate-700">We may share your information with:</p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Service Providers:</strong> Third parties who perform services on our behalf (hosting, payment processing, email delivery, analytics)</li>
                <li><strong>Coaches and Mentors:</strong> Information necessary to provide coaching services</li>
                <li><strong>Business Partners:</strong> For joint marketing or service offerings (with your consent)</li>
                <li><strong>Advertising Partners:</strong> For targeted advertising purposes (Facebook, Google)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, property, safety, or that of others</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800">Key Third-Party Services:</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
                <li><strong>Replit:</strong> Application hosting</li>
                <li><strong>Anthropic (Claude):</strong> AI-powered features</li>
                <li><strong>Meta (Facebook):</strong> Advertising and analytics</li>
                <li><strong>Google:</strong> Analytics and authentication</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">7. INTERNATIONAL DATA TRANSFERS</h2>
              <p className="text-slate-700">
                Your information may be transferred to and processed in countries other than your country of residence, including the United Arab Emirates, United States, United Kingdom, and European Union. These countries may have different data protection laws.
              </p>
              <p className="text-slate-700">
                When we transfer data internationally, we implement appropriate safeguards including:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Standard Contractual Clauses approved by relevant authorities</li>
                <li>Data processing agreements with service providers</li>
                <li>Compliance with applicable data transfer frameworks</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">8. DATA RETENTION</h2>
              <p className="text-slate-700">
                We retain your personal data for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Provide the Services and maintain your account</li>
                <li>Comply with legal obligations (tax, accounting, regulatory requirements)</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Pursue legitimate business interests</li>
              </ul>
              <p className="text-slate-700">
                Generally, we retain account data for the duration of your account plus 7 years. Marketing data is retained until you opt out. Usage data is typically retained for 26 months.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">9. YOUR RIGHTS</h2>
              <p className="text-slate-700">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>

              <h3 className="text-lg font-bold text-slate-800">For All Users:</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800">Additional Rights (EEA/UK - GDPR):</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
                <li><strong>Lodge Complaint:</strong> File a complaint with a supervisory authority</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800">Additional Rights (California - CCPA/CPRA):</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Know:</strong> Request information about data collection and sharing</li>
                <li><strong>Delete:</strong> Request deletion of personal information</li>
                <li><strong>Opt-Out of Sale:</strong> We do not sell personal information</li>
                <li><strong>Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
              </ul>

              <p className="text-slate-700">
                To exercise these rights, contact us at matt@mattwebley.com. We will respond within the timeframe required by applicable law (typically 30 days).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">10. DATA SECURITY</h2>
              <p className="text-slate-700">
                We implement appropriate technical and organizational measures to protect your personal data, including:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Encryption of data in transit (TLS/SSL)</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security assessments</li>
                <li>Access controls and employee training</li>
                <li>Use of reputable, security-compliant service providers</li>
              </ul>
              <p className="text-slate-700">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">11. CHILDREN'S PRIVACY</h2>
              <p className="text-slate-700">
                Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected data from a child, we will delete it promptly. If you believe a child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">12. THIRD-PARTY LINKS</h2>
              <p className="text-slate-700">
                Our Services may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">13. DO NOT TRACK</h2>
              <p className="text-slate-700">
                Some browsers transmit "Do Not Track" signals. Our Services do not currently respond to these signals. However, you can manage tracking through cookie settings and opt-out mechanisms provided by advertising networks.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">14. CHANGES TO THIS POLICY</h2>
              <p className="text-slate-700">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our website with a new "Last Updated" date. Your continued use of the Services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">15. CONTACT US</h2>
              <p className="text-slate-700">
                For questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700">
                <p><strong>Webley Global - FZCO</strong></p>
                <p>Building A1, Dubai Digital Park</p>
                <p>Dubai Silicon Oasis, IFZA Business Park, DDP</p>
                <p>Dubai, United Arab Emirates</p>
                <p className="mt-2">Email: matt@mattwebley.com</p>
              </div>
            </section>

          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          © {new Date().getFullYear()} Webley Global - FZCO. All rights reserved.
        </p>
      </div>
    </div>
  );
}
