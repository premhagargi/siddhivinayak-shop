export const dynamic = 'force-dynamic';

import Link from "next/link";
import Image from "next/image";

const blogPosts = [
  {
    id: 1,
    title: "The Art of Banarasi Silk: A Journey Through India's Textile Heritage",
    excerpt: "Discover the intricate craftsmanship behind Banarasi sarees, where ancient techniques meet modern elegance in the heart of India's silk weaving capital.",
    image: "/assets/blogs/banarasi-silk.jpg",
    category: "Silk",
    readTime: "5 min read",
    date: "December 15, 2024",
    tags: ["India", "Silk", "Saree", "Heritage"]
  },
  {
    id: 2,
    title: "Silver Stories: The Sacred Symbolism in Indian Silver Idols",
    excerpt: "Explore the spiritual significance and artistic mastery of silver idols that have adorned Indian homes and temples for centuries.",
    image: "/assets/blogs/silver-idols.jpg",
    category: "Silver",
    readTime: "4 min read",
    date: "December 12, 2024",
    tags: ["India", "Silver", "Spirituality", "Art"]
  },
  {
    id: 3,
    title: "Gift Giving Traditions: Choosing the Perfect Indian Wedding Gift",
    excerpt: "From auspicious silver coins to exquisite sarees, learn the art of selecting meaningful gifts for Indian weddings and celebrations.",
    image: "/assets/blogs/wedding-gifts.jpg",
    category: "Gift Ideas",
    readTime: "6 min read",
    date: "December 10, 2024",
    tags: ["India", "Gifts", "Weddings", "Traditions"]
  },
  {
    id: 4,
    title: "The Evolution of Saree Styles: From Traditional to Contemporary",
    excerpt: "How modern designers are reimagining the classic saree, blending traditional Indian craftsmanship with contemporary fashion sensibilities.",
    image: "/assets/blogs/modern-saree.jpg",
    category: "Saree",
    readTime: "7 min read",
    date: "December 8, 2024",
    tags: ["India", "Saree", "Fashion", "Modern"]
  },
  {
    id: 5,
    title: "999 Silver Purity: Understanding Hallmark Certification in India",
    excerpt: "Everything you need to know about silver purity standards, hallmark certification, and what it means for your silver jewelry investment.",
    image: "/assets/blogs/silver-hallmark.jpg",
    category: "Silver",
    readTime: "5 min read",
    date: "December 5, 2024",
    tags: ["India", "Silver", "Certification", "Investment"]
  },
  {
    id: 6,
    title: "Festive Gift Collections: Celebrating India's Cultural Diversity",
    excerpt: "Curated gift ideas that celebrate India's rich festivals, from Diwali lamps to Christmas ornaments, each telling a unique story.",
    image: "/assets/blogs/festive-gifts.jpg",
    category: "Gift Ideas",
    readTime: "6 min read",
    date: "December 3, 2024",
    tags: ["India", "Gifts", "Festivals", "Culture"]
  }
];

export default function BlogsPage() {
  return (
    <div className="container mx-auto px-4 pt-40 pb-20 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-4 block">
            Stories & Insights
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight uppercase text-primary mb-6">
            Our Blog
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover the rich heritage of Indian craftsmanship, timeless traditions, and contemporary design inspirations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post) => (
            <article key={post.id} className="group border border-transparent hover:border-border transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-4">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white text-xs font-bold uppercase tracking-widest px-3 py-1">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h2 className="font-headline text-xl font-semibold tracking-tight text-primary group-hover:text-accent transition-colors">
                  <Link href={`/blogs/${post.id}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1">
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/blogs/${post.id}`}
                  className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium text-sm transition-colors"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-secondary/20 p-8">
            <h3 className="font-headline text-2xl font-bold text-primary mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get the latest stories about Indian craftsmanship, festival traditions, and design inspiration delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-muted bg-background text-sm focus:outline-none focus:border-primary"
              />
              <button className="bg-primary text-white px-6 py-3 font-medium text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}