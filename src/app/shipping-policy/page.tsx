export const dynamic = 'force-dynamic';

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 pt-40 pb-20 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-4 block">
            Shipping & Delivery
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight uppercase text-primary mb-6">
            Shipping Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Learn about our shipping methods, delivery times, and logistics.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Shipping Methods</h2>
            <div className="space-y-6">
              <div className="border border-muted p-6">
                <h3 className="font-semibold text-lg mb-2">Express Premium Shipping</h3>
                <p className="text-muted-foreground mb-3">3-5 Business Days • Free on orders above ₹10,000</p>
                <p className="text-sm text-muted-foreground">Premium logistics with real-time tracking, insurance coverage, and priority handling for your valuable sarees and silver items.</p>
              </div>

              <div className="border border-muted p-6">
                <h3 className="font-semibold text-lg mb-2">Standard Care Shipping</h3>
                <p className="text-muted-foreground mb-3">7-10 Business Days • ₹500</p>
                <p className="text-sm text-muted-foreground">Carefully packaged with protective materials, perfect for non-urgent deliveries with full tracking information.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Processing Time</h2>
            <div className="bg-secondary/20 p-6">
              <ul className="space-y-2 text-muted-foreground">
                <li>• Standard items: 2-3 business days processing</li>
                <li>• Custom orders: 10-15 business days processing</li>
                <li>• Silver items: 3-5 business days processing</li>
                <li>• Orders are processed Monday through Friday, excluding holidays</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">International Shipping</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We ship worldwide with premium international carriers. Shipping costs and delivery times vary by destination.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-muted p-4">
                  <h4 className="font-semibold mb-2">Major Destinations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• USA & Canada: 7-12 days</li>
                    <li>• UK & Europe: 5-10 days</li>
                    <li>• Middle East: 4-8 days</li>
                    <li>• Southeast Asia: 3-7 days</li>
                  </ul>
                </div>
                <div className="border border-muted p-4">
                  <h4 className="font-semibold mb-2">Additional Services</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Customs clearance assistance</li>
                    <li>• International insurance</li>
                    <li>• Duty calculation support</li>
                    <li>• Multi-language tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Tracking & Updates</h2>
            <p className="text-muted-foreground mb-4">
              All orders include tracking information sent via email and SMS. You can also track your order through our website.
            </p>
            <div className="bg-accent/5 border border-accent/20 p-4">
              <p className="text-sm">
                <strong>Note:</strong> Tracking updates may take 24-48 hours to appear after shipping. For urgent inquiries, contact our support team.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Shipping Restrictions</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Due to the delicate nature of our products, we currently do not ship to certain remote locations.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Remote islands and territories</li>
                <li>Areas with postal service restrictions</li>
                <li>Countries with import restrictions on cultural items</li>
                <li>PO Box addresses</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}