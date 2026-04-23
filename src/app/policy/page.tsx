import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function PolicyPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <section className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold">Privacy Policy</h1>
            <p className="text-white/40">Last updated: March 29, 2026</p>
          </div>

          <div className="prose-custom space-y-8 text-white/50 leading-relaxed">
            <section>
              <h2 className="mb-4 text-2xl font-heading font-bold text-white">1. Information We Collect</h2>
              <p>
                We collect information you provide directly when creating an account, purchasing courses,
                or contacting support. This includes your name, email address, and payment information.
                Payment processing is handled securely through Razorpay — we never store your card details.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-heading font-bold text-white">2. How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul className="ml-6 mt-2 list-disc space-y-1">
                <li>Provide and maintain your account</li>
                <li>Process course purchases and grant access</li>
                <li>Send important updates about your courses</li>
                <li>Improve our platform and services</li>
                <li>Respond to support inquiries</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-heading font-bold text-white">3. Data Security</h2>
              <p>
                We implement industry-standard security measures including encrypted connections (HTTPS),
                hashed passwords (bcrypt), and secure session management. Video content is protected
                through DRM via VdoCipher.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-heading font-bold text-white">4. Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul className="ml-6 mt-2 list-disc space-y-1">
                <li><strong>Razorpay</strong> — Payment processing</li>
                <li><strong>VdoCipher</strong> — Secure video hosting and DRM</li>
                <li><strong>Resend</strong> — Transactional emails</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-heading font-bold text-white">5. Refund Policy</h2>
              <p>
                Due to the digital nature of our courses, all sales are final. If you experience technical
                issues accessing purchased content, contact our support team for assistance.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-heading font-bold text-white">6. Contact</h2>
              <p>
                For questions about this policy, contact us at{' '}
                <a href="mailto:support@inneredgecapital.com" className="text-[var(--accent)] underline underline-offset-4">
                  support@inneredgecapital.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
