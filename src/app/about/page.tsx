
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 pt-40 pb-24 md:px-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-accent">Heritage & Vision</span>
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight uppercase leading-none">
              A Legacy of Understated Luxury.
            </h1>
          </div>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
            <p>
              Founded in the heart of India, Siddhivinayak began with a single mission: to redefine traditional Indian elegance for the modern, discerning woman. 
            </p>
            <p>
              We believe that true luxury lies in the details—the whisper of premium silk, the intricate strike of an artisan's hammer on pure silver, and the timelessness of a silhouette that transcends seasonal trends.
            </p>
            <p>
              Our collections are a bridge between the glorious past of Indian craftsmanship and a minimal, sophisticated future. We source exclusively from master weavers and certified silver artisans, ensuring that every piece you take home is an investment in quality.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-8">
            <div>
              <h4 className="text-4xl font-bold tracking-tight">12+</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Artisan Clusters</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold tracking-tight">100%</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Ethical Sourcing</p>
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/5] bg-muted overflow-hidden">
          <Image 
            src="https://picsum.photos/seed/about/1000/1200" 
            alt="Artisan at work" 
            fill 
            className="object-cover"
          />
        </div>
      </div>

      <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-24 border-t pt-24">
        <div className="space-y-6">
          <h3 className="text-xl font-bold uppercase tracking-tight">Our Philosophy</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We reject the ornate for the essential. Our design language is rooted in minimalism, allowing the inherent beauty of the material to shine through without distraction.
          </p>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-bold uppercase tracking-tight">Craftsmanship</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every thread of our sarees and every gram of our silver is handled with care by skilled artisans whose families have perfected these crafts over centuries.
          </p>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-bold uppercase tracking-tight">Sustainability</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By focusing on timeless pieces, we encourage conscious consumption. We use recycled silver and promote slow fashion through high-durability handlooms.
          </p>
        </div>
      </div>
    </div>
  );
}
