export const dynamic = 'force-dynamic';

export default function ReturnsPolicyPage() {
  return (
    <div className="container mx-auto px-4 pt-40 pb-20 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-4 block">
            Returns & Exchanges
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight uppercase text-primary mb-6">
            Returns & Exchanges Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We want you to be completely satisfied with your purchase. Learn about our return and exchange process.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Return Window</h2>
            <div className="bg-secondary/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold text-lg">30</span>
                </div>
                <div>
                  <h3 className="font-semibold">30-Day Return Policy</h3>
                  <p className="text-sm text-muted-foreground">Return unused items in original packaging within 30 days of delivery</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                All returns must be initiated within 30 days of delivery. Items must be unused, in original packaging, with all tags and certificates intact.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">What Can Be Returned</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-muted p-6">
                <h3 className="font-semibold mb-3 text-green-600">✓ Eligible for Return</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Standard sarees and ready-to-wear</li>
                  <li>• Silver jewelry and accessories</li>
                  <li>• Gift sets and collections</li>
                  <li>• Items in original condition</li>
                  <li>• With all original packaging</li>
                </ul>
              </div>

              <div className="border border-muted p-6">
                <h3 className="font-semibold mb-3 text-red-600">✗ Not Eligible for Return</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Custom made-to-order items</li>
                  <li>• Personalized or monogrammed items</li>
                  <li>• Items damaged by customer</li>
                  <li>• Items missing certificates</li>
                  <li>• Used or worn items</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Return Process</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white flex items-center justify-center font-bold rounded-full">1</div>
                <div>
                  <h3 className="font-semibold mb-2">Contact Our Team</h3>
                  <p className="text-muted-foreground">Email us at returns@siddhivinayak.com or call our support line with your order number and reason for return.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white flex items-center justify-center font-bold rounded-full">2</div>
                <div>
                  <h3 className="font-semibold mb-2">Receive Return Authorization</h3>
                  <p className="text-muted-foreground">We'll provide a return authorization number and prepaid shipping label for eligible returns.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white flex items-center justify-center font-bold rounded-full">3</div>
                <div>
                  <h3 className="font-semibold mb-2">Package & Ship</h3>
                  <p className="text-muted-foreground">Carefully package the item in its original packaging and ship using the provided label.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white flex items-center justify-center font-bold rounded-full">4</div>
                <div>
                  <h3 className="font-semibold mb-2">Refund Processing</h3>
                  <p className="text-muted-foreground">Once received and inspected, we'll process your refund within 5-7 business days.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Exchanges</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We offer hassle-free exchanges for size, color, or style changes within 30 days of delivery.
              </p>
              <div className="bg-accent/5 border border-accent/20 p-4">
                <h4 className="font-semibold mb-2">Exchange Benefits:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Free shipping on exchanges</li>
                  <li>• No restocking fees</li>
                  <li>• Priority processing</li>
                  <li>• Size adjustments at no extra cost</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Refund Policy</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Refunds are processed to the original payment method within 5-7 business days after item inspection.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-muted">
                  <div className="text-2xl font-bold text-accent mb-2">5-7</div>
                  <div className="text-sm text-muted-foreground">Business Days</div>
                </div>
                <div className="text-center p-4 border border-muted">
                  <div className="text-2xl font-bold text-accent mb-2">Original</div>
                  <div className="text-sm text-muted-foreground">Payment Method</div>
                </div>
                <div className="text-center p-4 border border-muted">
                  <div className="text-2xl font-bold text-accent mb-2">Full</div>
                  <div className="text-sm text-muted-foreground">Refund Amount</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Contact Information</h2>
            <div className="bg-secondary/20 p-6">
              <p className="text-muted-foreground mb-4">
                Need help with a return or exchange? Our customer service team is here to assist you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Email Support</h4>
                  <p className="text-sm text-muted-foreground">returns@siddhivinayak.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phone Support</h4>
                  <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}