export const dynamic = 'force-dynamic';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I care for my silk saree?",
    answer: "Silk sarees require gentle care. Dry clean only, avoid direct sunlight, store in a cool dry place, and avoid strong perfumes or deodorants that can stain the fabric."
  },
  {
    question: "What is the purity of your silver items?",
    answer: "All our silver items are made from 999 pure silver (also known as 99.9% pure silver or sterling silver). Each piece comes with a hallmark certification."
  },
  {
    question: "Do you offer customization?",
    answer: "Yes, we offer customization for sarees including color variations and silver items. Please contact us for custom orders with at least 2-3 weeks lead time."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for unused items in original packaging. Custom orders are not eligible for returns. Please see our detailed returns policy for more information."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard delivery takes 7-10 business days. Express premium shipping takes 3-5 business days. International shipping varies by destination."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship worldwide. International shipping costs and delivery times vary by destination. All shipments include tracking information."
  },
  {
    question: "Are your products authentic?",
    answer: "Yes, all our products are 100% authentic. Sarees are handwoven by master craftsmen in India, and silver items are hallmarked for purity."
  },
  {
    question: "Can I place a custom order?",
    answer: "Absolutely! We specialize in custom sarees and silver items. Contact us with your requirements, and our artisans will create something special for you."
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 pt-40 pb-20 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-4 block">
            Support Center
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight uppercase text-primary mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, and services.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-muted px-6 py-2"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-medium text-primary">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
          >
            Contact Our Support Team →
          </a>
        </div>
      </div>
    </div>
  );
}