import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
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
            <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service & Legal Agreement</h1>
            <p className="text-slate-500">Last Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">1. PARTIES AND AGREEMENT</h2>
              <p className="text-slate-700">
                This legally binding Agreement ("Agreement") is entered into between <strong>Webley Global - FZCO</strong>, a Free Zone Company duly registered and operating under the laws of the United Arab Emirates, with its principal place of business in Dubai, UAE ("Company," "we," "us," or "our"), and you, the individual or entity accessing or using our services ("User," "you," or "your").
              </p>
              <p className="text-slate-700">
                BY ACCESSING, BROWSING, OR USING THE 21-DAY AI SAAS CHALLENGE PLATFORM, WEBSITE, COACHING SERVICES, DIGITAL PRODUCTS, OR ANY RELATED SERVICES (COLLECTIVELY, THE "SERVICES"), YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY ALL TERMS AND CONDITIONS SET FORTH IN THIS AGREEMENT. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST IMMEDIATELY CEASE ALL USE OF THE SERVICES.
              </p>
              <p className="text-slate-700">
                Your continued use of the Services following any modifications to this Agreement constitutes acceptance of those modifications. We reserve the right to modify these terms at any time without prior notice.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">2. NATURE OF SERVICES</h2>
              <p className="text-slate-700">
                The Services consist of educational content, coaching, mentorship, digital courses, software tools, and related materials designed to teach users about building software applications using artificial intelligence tools. The Services are provided strictly for educational and informational purposes.
              </p>
              <p className="text-slate-700">
                <strong>THE SERVICES DO NOT CONSTITUTE:</strong>
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Professional business, legal, financial, investment, tax, or accounting advice</li>
                <li>A guarantee, promise, or representation of any specific outcome, income, or result</li>
                <li>A business opportunity, franchise, multi-level marketing scheme, or investment vehicle</li>
                <li>Professional software development, consulting, or contracting services</li>
                <li>A partnership, joint venture, or agency relationship between you and the Company</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">3. COMPREHENSIVE DISCLAIMER OF WARRANTIES</h2>
              <p className="text-slate-700 font-bold uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW IN ALL JURISDICTIONS INCLUDING BUT NOT LIMITED TO THE UNITED ARAB EMIRATES, UNITED KINGDOM, AND UNITED STATES:
              </p>
              <p className="text-slate-700">
                THE SERVICES ARE PROVIDED ON AN "AS IS," "AS AVAILABLE," AND "WITH ALL FAULTS" BASIS. THE COMPANY EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>IMPLIED WARRANTIES OF MERCHANTABILITY</li>
                <li>FITNESS FOR A PARTICULAR PURPOSE</li>
                <li>NON-INFRINGEMENT</li>
                <li>TITLE</li>
                <li>ACCURACY, RELIABILITY, OR COMPLETENESS OF CONTENT</li>
                <li>THAT THE SERVICES WILL MEET YOUR REQUIREMENTS OR EXPECTATIONS</li>
                <li>THAT THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE</li>
                <li>THAT ANY ERRORS OR DEFECTS WILL BE CORRECTED</li>
                <li>THAT THE SERVICES ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS</li>
              </ul>
              <p className="text-slate-700">
                NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED FROM THE COMPANY OR THROUGH THE SERVICES SHALL CREATE ANY WARRANTY NOT EXPRESSLY STATED HEREIN.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">4. EARNINGS AND RESULTS DISCLAIMER</h2>
              <p className="text-slate-700 font-bold">
                CRITICAL NOTICE REGARDING INCOME AND RESULTS:
              </p>
              <p className="text-slate-700">
                Any statements, examples, case studies, testimonials, or demonstrations of results or earnings (whether past, present, or projected) are provided for illustrative and educational purposes only. They represent exceptional results that are not typical and should not be construed as a guarantee or promise of similar results.
              </p>
              <p className="text-slate-700 font-bold">
                YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>The Company makes NO guarantee of income, revenue, profit, or any financial result</li>
                <li>The vast majority of software products and businesses fail to generate significant revenue</li>
                <li>Your results depend entirely on your own effort, skill, market conditions, timing, competition, and numerous factors completely outside the Company's control</li>
                <li>Past performance of any individual or case study does not indicate or guarantee future results</li>
                <li>The Company has no obligation to provide ongoing updates or corrections to any educational content</li>
                <li>Industry statistics show that the majority of new software products never achieve commercial success</li>
                <li>There is inherent risk in any business endeavor and you may lose money</li>
              </ul>
              <p className="text-slate-700">
                BY USING THE SERVICES, YOU ACCEPT FULL RESPONSIBILITY FOR YOUR OWN DECISIONS, ACTIONS, AND RESULTS. YOU RELEASE THE COMPANY FROM ANY AND ALL CLAIMS RELATED TO YOUR BUSINESS OUTCOMES.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">5. LIMITATION OF LIABILITY</h2>
              <p className="text-slate-700 font-bold uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW IN ALL APPLICABLE JURISDICTIONS:
              </p>
              <p className="text-slate-700">
                IN NO EVENT SHALL THE COMPANY, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, AFFILIATES, SUBSIDIARIES, SUCCESSORS, ASSIGNS, LICENSORS, SERVICE PROVIDERS, CONTRACTORS, COACHES, MENTORS, OR ANY OTHER PARTY INVOLVED IN CREATING, PRODUCING, OR DELIVERING THE SERVICES (COLLECTIVELY, "RELEASED PARTIES") BE LIABLE TO YOU OR ANY THIRD PARTY FOR:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES</li>
                <li>LOSS OF PROFITS, REVENUE, BUSINESS, GOODWILL, OR ANTICIPATED SAVINGS</li>
                <li>LOSS OF DATA OR DATA BREACH</li>
                <li>BUSINESS INTERRUPTION</li>
                <li>PERSONAL INJURY OR EMOTIONAL DISTRESS</li>
                <li>ANY DAMAGES ARISING FROM YOUR USE OR INABILITY TO USE THE SERVICES</li>
                <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY</li>
                <li>ANY CONTENT OBTAINED FROM THE SERVICES</li>
                <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
              </ul>
              <p className="text-slate-700 font-bold">
                REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE), EVEN IF THE RELEASED PARTIES HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="text-slate-700 font-bold">
                IN ANY EVENT, THE TOTAL AGGREGATE LIABILITY OF ALL RELEASED PARTIES FOR ALL CLAIMS ARISING FROM OR RELATED TO THIS AGREEMENT OR THE SERVICES SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT YOU ACTUALLY PAID TO THE COMPANY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED US DOLLARS (USD $100.00).
              </p>
              <p className="text-slate-700">
                SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE EXCLUSIONS OR LIMITATIONS MAY NOT APPLY, AND YOU MAY HAVE ADDITIONAL RIGHTS. HOWEVER, IN SUCH CASES, THE LIABILITY OF THE RELEASED PARTIES SHALL BE LIMITED TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">6. COMPREHENSIVE INDEMNIFICATION</h2>
              <p className="text-slate-700">
                You agree to defend, indemnify, and hold harmless the Released Parties from and against any and all claims, damages, obligations, losses, liabilities, costs, debts, and expenses (including but not limited to attorneys' fees, expert witness fees, and costs of investigation and litigation) arising from or related to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Your access to or use of the Services</li>
                <li>Your violation of any term of this Agreement</li>
                <li>Your violation of any third-party right, including any intellectual property, privacy, or proprietary right</li>
                <li>Your violation of any applicable law, rule, or regulation in any jurisdiction</li>
                <li>Any claim that your content or actions caused damage to a third party</li>
                <li>Any products, services, or businesses you create or operate</li>
                <li>Any disputes between you and any third party, including customers, clients, or users of your products</li>
                <li>Any tax obligations or liabilities you incur</li>
                <li>Any employment, contractor, or labor disputes related to your activities</li>
              </ul>
              <p className="text-slate-700">
                This indemnification obligation shall survive the termination of this Agreement and your use of the Services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">7. REFUND AND PAYMENT POLICY</h2>
              <p className="text-slate-700 font-bold">
                ALL SALES ARE FINAL. DUE TO THE DIGITAL AND IMMEDIATELY ACCESSIBLE NATURE OF THE SERVICES:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>No refunds, credits, or exchanges will be provided except where required by applicable law</li>
                <li>Digital products and course access are non-refundable once delivered or access is granted</li>
                <li>Coaching sessions are non-refundable once booked or completed</li>
                <li>The Company reserves sole discretion to offer refunds, credits, or exchanges in exceptional circumstances</li>
                <li>Chargebacks or payment disputes filed in bad faith may result in permanent account termination, collection actions, and reporting to credit agencies</li>
              </ul>
              <p className="text-slate-700">
                By making a purchase, you acknowledge that you are making an informed decision and waive any right to a refund to the maximum extent permitted by law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">8. COACHING AND MENTORSHIP DISCLAIMER</h2>
              <p className="text-slate-700">
                Coaching and mentorship services are provided for educational purposes only. Coaches and mentors are not licensed professionals (such as attorneys, accountants, or financial advisors) unless explicitly stated. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Coaching is not therapy, counseling, or professional advice</li>
                <li>You are solely responsible for your own decisions and actions</li>
                <li>The Company does not guarantee coach availability, scheduling, or specific outcomes</li>
                <li>Session recordings, notes, or materials remain the property of the Company</li>
                <li>You will not hold coaches personally liable for any advice or guidance provided</li>
                <li>Coaches may be contractors and not employees of the Company</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">9. INTELLECTUAL PROPERTY</h2>
              <p className="text-slate-700">
                All content, materials, software, graphics, designs, text, images, audio, video, trademarks, service marks, trade names, and other intellectual property in the Services are owned by or licensed to the Company and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-slate-700 font-bold">
                YOU MAY NOT:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Copy, reproduce, distribute, or create derivative works of any content</li>
                <li>Reverse engineer, decompile, or disassemble any software</li>
                <li>Remove, alter, or obscure any proprietary notices</li>
                <li>Use the content for commercial purposes without written permission</li>
                <li>Share, resell, or transfer your account access to any third party</li>
                <li>Record, screenshot, or capture coaching sessions without written consent</li>
              </ul>
              <p className="text-slate-700">
                Any software or code you create using knowledge from the Services belongs to you, but the course content, methodologies, and materials remain our exclusive property.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">10. USER CONDUCT AND RESPONSIBILITIES</h2>
              <p className="text-slate-700">
                You agree that you will NOT:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Use the Services for any unlawful purpose or in violation of any applicable laws</li>
                <li>Harass, abuse, threaten, or intimidate other users, coaches, or staff</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the Services or servers</li>
                <li>Attempt to gain unauthorized access to any systems or accounts</li>
                <li>Use automated systems, bots, or scripts without permission</li>
                <li>Upload or transmit viruses, malware, or other harmful code</li>
                <li>Collect or harvest personal information of other users</li>
                <li>Engage in any activity that could damage the Company's reputation</li>
              </ul>
              <p className="text-slate-700">
                Violation of these terms may result in immediate termination of access without refund and potential legal action.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">11. THIRD-PARTY SERVICES AND LINKS</h2>
              <p className="text-slate-700">
                The Services may contain links to third-party websites, services, or integrations (including but not limited to payment processors, AI services, hosting providers, and software tools). The Company:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Does not control, endorse, or assume responsibility for any third-party services</li>
                <li>Is not liable for any damages arising from your use of third-party services</li>
                <li>Does not guarantee the availability, accuracy, or security of third-party services</li>
                <li>Recommends you review the terms and privacy policies of all third-party services</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">12. PRIVACY AND DATA</h2>
              <p className="text-slate-700">
                Your use of the Services is also governed by our Privacy Policy. By using the Services, you consent to the collection, use, and sharing of your information as described in the Privacy Policy. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>We may collect and process personal data in accordance with applicable laws</li>
                <li>Data may be transferred and stored in multiple jurisdictions including the UAE, UK, US, and other countries</li>
                <li>We use third-party services that may have access to your data</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">13. GOVERNING LAW AND JURISDICTION</h2>
              <p className="text-slate-700">
                This Agreement shall be governed by and construed in accordance with the laws of the United Arab Emirates, specifically the laws applicable in the Emirate of Dubai, without regard to conflict of law principles.
              </p>
              <p className="text-slate-700 font-bold">
                EXCLUSIVE JURISDICTION:
              </p>
              <p className="text-slate-700">
                You agree that any dispute, claim, or controversy arising out of or relating to this Agreement or the Services shall be resolved exclusively in the courts of Dubai, United Arab Emirates. You irrevocably submit to the exclusive jurisdiction of such courts and waive any objection to venue or inconvenient forum.
              </p>
              <p className="text-slate-700">
                <strong>For users in the United Kingdom:</strong> Nothing in this Agreement affects your statutory rights as a consumer under UK law where such rights cannot be excluded or limited by contract. However, to the maximum extent permitted, UAE law and jurisdiction shall apply.
              </p>
              <p className="text-slate-700">
                <strong>For users in the United States:</strong> You waive any right to participate in a class action lawsuit or class-wide arbitration against the Company. Any dispute must be brought in your individual capacity only.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">14. DISPUTE RESOLUTION AND ARBITRATION</h2>
              <p className="text-slate-700 font-bold">
                MANDATORY ARBITRATION:
              </p>
              <p className="text-slate-700">
                Any dispute, controversy, or claim arising out of or relating to this Agreement, including its formation, interpretation, breach, or termination, shall be finally resolved by binding arbitration administered by the Dubai International Arbitration Centre (DIAC) in accordance with its Arbitration Rules.
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>The seat of arbitration shall be Dubai, UAE</li>
                <li>The language of arbitration shall be English</li>
                <li>There shall be one arbitrator appointed in accordance with DIAC Rules</li>
                <li>The arbitrator's decision shall be final and binding</li>
                <li>Judgment on the award may be entered in any court having jurisdiction</li>
              </ul>
              <p className="text-slate-700 font-bold">
                CLASS ACTION WAIVER:
              </p>
              <p className="text-slate-700">
                YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. YOU WAIVE ANY RIGHT TO PARTICIPATE IN ANY CLASS ACTION AGAINST THE COMPANY.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">15. FORCE MAJEURE</h2>
              <p className="text-slate-700">
                The Company shall not be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to: acts of God, natural disasters, pandemic, epidemic, war, terrorism, riots, civil unrest, government actions, labor disputes, power failures, internet or telecommunications failures, cyberattacks, or any other cause beyond reasonable control.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">16. TERMINATION</h2>
              <p className="text-slate-700">
                The Company reserves the right to terminate or suspend your access to the Services at any time, for any reason or no reason, with or without notice, and without liability. Upon termination:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>All licenses and rights granted to you immediately terminate</li>
                <li>You must cease all use of the Services</li>
                <li>No refunds will be provided for any unused portion</li>
                <li>Sections relating to liability, indemnification, and dispute resolution survive termination</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">17. SEVERABILITY</h2>
              <p className="text-slate-700">
                If any provision of this Agreement is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such finding shall not affect the validity of the remaining provisions, which shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the parties' original intent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">18. ENTIRE AGREEMENT</h2>
              <p className="text-slate-700">
                This Agreement, together with the Privacy Policy and any other legal notices or policies published on the Services, constitutes the entire agreement between you and the Company regarding the Services. This Agreement supersedes all prior agreements, representations, warranties, and understandings, whether written or oral, regarding the subject matter hereof.
              </p>
              <p className="text-slate-700">
                No waiver of any term shall be deemed a further or continuing waiver of such term or any other term. The Company's failure to enforce any right or provision shall not constitute a waiver of such right or provision.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">19. ASSIGNMENT</h2>
              <p className="text-slate-700">
                You may not assign or transfer this Agreement or any rights hereunder without the prior written consent of the Company. The Company may freely assign this Agreement without restriction. Any attempted assignment in violation of this section shall be void.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">20. CONTACT INFORMATION</h2>
              <p className="text-slate-700">
                For questions regarding this Agreement, please contact:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700">
                <p><strong>Webley Global - FZCO</strong></p>
                <p>Building A1, Dubai Digital Park</p>
                <p>Dubai Silicon Oasis</p>
                <p>IFZA Business Park, DDP</p>
                <p>Dubai, United Arab Emirates</p>
                <p className="mt-2">Email: matt@mattwebley.com</p>
              </div>
            </section>

            <section className="space-y-4 bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-slate-900">ACKNOWLEDGMENT</h2>
              <p className="text-slate-700">
                BY USING THE SERVICES, YOU ACKNOWLEDGE THAT:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>YOU HAVE READ THIS AGREEMENT IN ITS ENTIRETY</li>
                <li>YOU UNDERSTAND ALL TERMS AND CONDITIONS</li>
                <li>YOU VOLUNTARILY AGREE TO BE BOUND BY THIS AGREEMENT</li>
                <li>YOU ARE OF LEGAL AGE TO ENTER INTO A BINDING CONTRACT</li>
                <li>YOU HAVE THE LEGAL CAPACITY AND AUTHORITY TO AGREE TO THESE TERMS</li>
                <li>THIS AGREEMENT IS ENFORCEABLE AGAINST YOU</li>
              </ul>
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
