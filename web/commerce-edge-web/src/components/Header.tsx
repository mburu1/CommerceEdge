import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components';
import { useCart } from '@/hooks/useCart';
import { useCustomer, useLogout } from '@/hooks/useCustomer';

export function Header() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const { data: customer } = useCustomer();
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const navigation = [
    { name: 'Shop', href: '/shop' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2" aria-label="CommerceEdge Home">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-xl font-bold text-primary">CommerceEdge</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-secondary hover:text-primary'}`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block flex-1 max-w-md">
              <form role="search" className="relative">
                <label htmlFor="search" className="sr-only">Search products</label>
                <input
                  type="search"
                  id="search"
                  placeholder="Search products..."
                  className="input w-full pl-10 pr-4"
                  aria-label="Search products"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>
            </div>

            <div className="flex items-center gap-2">
              <button
                ref={cartButtonRef}
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-background"
                aria-label={isCartOpen ? 'Close cart' : 'Open cart'}
                aria-expanded={isCartOpen}
                aria-haspopup="dialog"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-danger text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {isCartOpen && (
                <div
                  ref={cartRef}
                  className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-lg shadow-lg overflow-hidden"
                  role="dialog"
                  aria-label="Shopping cart"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">Shopping Cart</h3>
                    <span className="text-sm text-secondary">
                      {cart?.items.length || 0} items
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {cart?.items.length === 0 ? (
                      <div className="p-8 text-center text-secondary">
                        <svg className="w-12 h-12 mx-auto mb-3 text-secondary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p>Your cart is empty</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-border">
                        {cart?.items.slice(0, 5).map((item) => (
                          <li key={item.id} className="p-4 flex gap-3">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <Link to={`/product/${item.productId}`} className="font-medium text-sm truncate block">
                                {item.product.name}
                              </Link>
                              <p className="text-sm text-secondary">{item.product.price.toFixed(2)} × {item.quantity}</p>
                            </div>
                          </li>
                        ))}
                        {cart && cart.items.length > 5 && (
                          <li className="p-4 text-center text-sm text-secondary">
                            And {cart.items.length - 5} more items...
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div className="p-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{cart?.subtotal.toFixed(2) || '0.00'}</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/cart');
                      }}
                    >
                      View Cart & Checkout
                    </Button>
                  </div>
                </div>
              )}

              <div className="relative" ref={userMenuRef}>
                {customer ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-background"
                      aria-label="User menu"
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-medium">
                        {customer.firstName[0]}{customer.lastName[0]}
                      </div>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
                        <div className="p-3 border-b border-border">
                          <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                          <p className="text-sm text-secondary">{customer.email}</p>
                        </div>
                        <NavLink
                          to="/account"
                          className="block px-4 py-2 text-sm hover:bg-background"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Account
                        </NavLink>
                        <NavLink
                          to="/account/orders"
                          className="block px-4 py-2 text-sm hover:bg-background"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Orders
                        </NavLink>
                        <NavLink
                          to="/account/addresses"
                          className="block px-4 py-2 text-sm hover:bg-background"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Addresses
                        </NavLink>
                        <hr className="my-1 border-border" />
                        <button
                          onClick={() => {
                            logout.mutate();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-background"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <NavLink
                      to="/login"
                      className="btn btn-secondary btn-sm"
                      end
                    >
                      Sign In
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="btn btn-primary btn-sm"
                    >
                      Sign Up
                    </NavLink>
                  </div>
                )}
              </div>

              <button
                ref={menuRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-background"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-border animate-slide-down">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className="px-2 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-background rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
              <hr className="my-2 border-border" />
              <div className="px-2 py-2 space-y-2">
                <input
                  type="search"
                  placeholder="Search products..."
                  className="input"
                  aria-label="Search products"
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}