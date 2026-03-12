
"use client";

import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SectionFadeIn from "@/components/animations/SectionFadeIn";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 pt-40 pb-24 md:px-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Left: Contact Info */}
        <SectionFadeIn className="space-y-16">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-accent">Contact Concierge</span>
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight uppercase leading-none">
              How Can We<br />Assist You?
            </h1>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-md">
              Whether you're looking for styling advice, product details, or help with an order, our concierge team is here to provide personalized support.
            </p>
          </div>

          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Studio Address</h3>
                <div className="flex gap-4">
                  <MapPin className="h-5 w-5 text-accent shrink-0" />
                  <p className="text-sm font-medium leading-relaxed">
                    Siddhivinayak Collection<br />
                    102, Heritage Plaza, MG Road<br />
                    Pune, Maharashtra 411001<br />
                    India
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Connect With Us</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Mail className="h-4 w-4 text-accent" />
                    <p className="text-sm font-medium">concierge@siddhivinayak.com</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="h-4 w-4 text-accent" />
                    <p className="text-sm font-medium">+91 20 2612 3456</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Follow Our Journey</h3>
              <div className="flex gap-6">
                <a href="#" className="p-3 border hover:bg-primary hover:text-white transition-all">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="p-3 border hover:bg-primary hover:text-white transition-all">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="p-3 border hover:bg-primary hover:text-white transition-all">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </SectionFadeIn>

        {/* Right: Contact Form */}
        <SectionFadeIn delay={0.2}>
          <div className="bg-secondary/30 p-10 md:p-16">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-10">Send a Message</h2>
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">Full Name</label>
                  <Input 
                    className="rounded-none h-14 border-muted focus:border-primary bg-background" 
                    placeholder="Anjali Kapoor" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">Email Address</label>
                  <Input 
                    type="email" 
                    className="rounded-none h-14 border-muted focus:border-primary bg-background" 
                    placeholder="anjali@example.com" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest">Subject</label>
                <Input 
                  className="rounded-none h-14 border-muted focus:border-primary bg-background" 
                  placeholder="Order Inquiry / Styling Advice" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest">Message</label>
                <Textarea 
                  className="rounded-none min-h-[160px] border-muted focus:border-primary bg-background resize-none" 
                  placeholder="How can we help you today?" 
                />
              </div>

              <Button className="w-full h-16 rounded-none bg-primary text-white font-bold uppercase tracking-widest group transition-all">
                Send Message <Send className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Button>
            </form>
          </div>
        </SectionFadeIn>
      </div>

      {/* Map Placeholder */}
      <SectionFadeIn className="mt-32 h-[400px] w-full bg-muted grayscale opacity-50 flex items-center justify-center border">
         <div className="text-center space-y-4">
            <MapPin className="h-12 w-12 text-primary/30 mx-auto" strokeWidth={1} />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Visit our flagship studio in Pune</p>
         </div>
      </SectionFadeIn>
    </div>
  );
}
