import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components';
import { categories, featuredProducts } from '@/data/demo';
import { useCategories, useFeaturedProducts } from '@/hooks';

const benefits = [
  {
    title: 'Curated quality',
    text: 'Useful, considered products selected for the way people live and work.',
    icon: 'M20 7l-9-4-9 4v10l9 4 9-4V7zM11 21v-8M11 13l-9-6M11 13l9-6',
  },
  {
    title: 'Fast fulfillment',
    text: 'Clear availability, reliable delivery windows, and order updates in one place.',
    icon: 'M3 7h13v10H3zM16 10h4l2 3v4h-6zM7 21a2 2 0 100-4 2 2 0 000 4zM18 21a2 2 0 100-4 2 2 0 000 4z',
  },
  {
    title: 'Human support',
    text: 'Helpful answers before and after purchase, whenever you need them.',
    icon: 'M21 12a8 8 0 11-16 0 8 8 0 0116 0zM8 12h8M12 8v8',
  },
];

export function HomePage() {
  const { data: remoteFeatured } = useFeaturedProducts(4);
  const { data: remoteCategories } = useCategories();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const displayedProducts = remoteFeatured && remoteFeatured.length > 0 ? remoteFeatured : featuredProducts;
  const displayedCategories = remoteCategories && remoteCategories.length > 0 ? remoteCategories : categories;

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">New season, better essentials</p>
            <h1>Objects that make room for what matters.</h1>
            <p className="hero-lede">
              Discover a focused collection of useful goods for home, work, and the spaces in between.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/shop">Shop the collection</Link>
              <Link className="btn btn-outline btn-lg" to="/categories">Browse categories</Link>
            </div>
            <div className="hero-proof">
              <span>Free shipping over $75</span>
              <span>30-day returns</span>
              <span>Secure checkout</span>
            </div>
          </div>
          <div className="hero-art" aria-label="CommerceEdge collection preview">
            <div className="hero-art-card hero-art-card-one" />
            <div className="hero-art-card hero-art-card-two" />
            <div className="hero-art-card hero-art-card-three" />
            <div className="hero-art-badge">
              <span>CommerceEdge</span>
              <strong>Everyday / Extraordinary</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The collection</p>
              <h2>Featured goods</h2>
            </div>
            <Link className="text-link" to="/shop">View all products <span aria-hidden="true">→</span></Link>
          </div>
          <div className="product-grid">
            {displayedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="category-band">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Find your next favorite</p>
              <h2>Shop by category</h2>
            </div>
          </div>
          <div className="category-grid">
            {displayedCategories.slice(0, 6).map((category) => (
              <Link className="category-tile" key={category.id} to={`/categories/${category.slug}`}>
                <img src={category.image || '/product-placeholder.svg'} alt="" />
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.productCount} products</p>
                </div>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container benefits-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.title}>
              <span className="benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={benefit.icon} /></svg>
              </span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="newsletter">
        <div className="container newsletter-inner">
          <div>
            <p className="eyebrow">Stay in the loop</p>
            <h2>Good things, occasionally.</h2>
            <p>Get new arrivals, useful stories, and thoughtful offers in your inbox.</p>
          </div>
          {subscribed ? (
            <div className="newsletter-success" role="status">You are on the list. Welcome aboard.</div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" required />
              <button className="btn btn-primary" type="submit">Subscribe</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
