import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <main className="page-shell">
      <header className="page-header container narrow"><p className="eyebrow">Our story</p><h1>Better commerce, thoughtfully built.</h1><p className="page-subtitle">CommerceEdge brings together useful products, clear information, and a checkout experience that respects your time.</p></header>
      <section className="container story-grid">
        <article className="story-card"><span>01</span><h2>Purposeful selection</h2><p>We focus on products that earn their place in your daily routine, with details that help you choose confidently.</p></article>
        <article className="story-card"><span>02</span><h2>Modern retail infrastructure</h2><p>Behind the storefront is a commerce platform designed around catalogs, inventory, customers, carts, orders, and reliable integrations.</p></article>
        <article className="story-card"><span>03</span><h2>Built to adapt</h2><p>CommerceEdge is an evolving learning platform for the architecture and engineering practices behind modern retail.</p></article>
      </section>
      <section className="about-cta"><div className="container"><h2>Ready to explore the collection?</h2><Link className="btn btn-primary btn-lg" to="/shop">Shop now</Link></div></section>
    </main>
  );
}
