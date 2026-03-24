export const dynamic = 'force-dynamic';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 pt-40 pb-20 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-4 block">
            Legal & Privacy
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight uppercase text-primary mb-6">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <p className="text-muted-foreground mb-8">
              <strong>Effective Date:</strong> January 1, 2024
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Siddhivinayak Collection ("we," "our," or "us") respects your privacy and is committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Information We Collect</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <p className="text-muted-foreground mb-3">We collect information you provide directly to us, including:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                  <li>Order history and preferences</li>
                  <li>Communications with our customer service</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Automatically Collected Information</h3>
                <p className="text-muted-foreground mb-3">When you visit our website, we automatically collect:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent</li>
                  <li>Device information</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">How We Use Your Information</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Provide customer service and support</li>
                <li>Send you important updates about your orders</li>
                <li>Improve our products and services</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Information Sharing</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who help us operate our business</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to the sharing</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Data Security</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access,
                alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>SSL encryption for data transmission</li>
                <li>Secure payment processing</li>
                <li>Regular security audits</li>
                <li>Employee training on data protection</li>
                <li>Limited access to personal information</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Cookies and Tracking</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content.
              </p>
              <div className="bg-secondary/20 p-4">
                <h4 className="font-semibold mb-2">Types of Cookies We Use:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
                  <li><strong>Marketing Cookies:</strong> Used to show relevant advertisements</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Your Rights</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">You have the following rights regarding your personal information:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-muted p-4">
                  <h4 className="font-semibold mb-2">Access & Portability</h4>
                  <p className="text-sm text-muted-foreground">Request a copy of your personal data</p>
                </div>
                <div className="border border-muted p-4">
                  <h4 className="font-semibold mb-2">Correction</h4>
                  <p className="text-sm text-muted-foreground">Update or correct inaccurate information</p>
                </div>
                <div className="border border-muted p-4">
                  <h4 className="font-semibold mb-2">Deletion</h4>
                  <p className="text-sm text-muted-foreground">Request deletion of your personal data</p>
                </div>
                <div className="border border-muted p-4">
                  <h4 className="font-semibold mb-2">Opt-out</h4>
                  <p className="text-sm text-muted-foreground">Unsubscribe from marketing communications</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Contact Us</h2>
            <div className="bg-secondary/20 p-6">
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-sm text-muted-foreground">privacy@siddhivinayak.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Address</h4>
                  <p className="text-sm text-muted-foreground">123 Heritage Street, Old City, India - 110001</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Protection Officer</h4>
                  <p className="text-sm text-muted-foreground">dpo@siddhivinayak.com</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Updates to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
              and updating the "Effective Date" at the top. Your continued use of our services after any changes constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}