import { Link } from 'react-router-dom';

const navigation = [
  { label: 'Shop', to: '/shop' },
  { label: 'Categories', to: '/categories' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="footer-brand" aria-label="CommerceEdge home">
            CommerceEdge
          </Link>
          <p className="footer-description">
            A modern omnichannel commerce experience for retailers and their customers.
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <nav className="footer-links" aria-label="Footer navigation">
            {navigation.map((item) => (
              <Link key={item.to} to={item.to}>{item.label}</Link>
            ))}
          </nav>
        </div>
        <div>
          <h2>Commerce</h2>
          <nav className="footer-links" aria-label="Commerce links">
            <Link to="/shop">Catalog</Link>
            <Link to="/cart">Shopping cart</Link>
            <Link to="/account/orders">Order history</Link>
          </nav>
        </div>
        <div>
          <h2>Support</h2>
          <nav className="footer-links" aria-label="Support links">
            <Link to="/contact">Contact us</Link>
            <Link to="/about">About CommerceEdge</Link>
          </nav>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CommerceEdge</span>
        <span>Built for modern retail</span>
      </div>
    </footer>
  );
}
