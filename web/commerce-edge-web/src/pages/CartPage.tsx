import { Link } from 'react-router-dom';
import { Alert, EmptyState, QuantitySelector } from '@/components';
import { useCart, useClearCart, useRemoveFromCart, useUpdateCartItem } from '@/hooks';
import { formatMoney } from '@/lib/utils';

export function CartPage() {
  const cartQuery = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();
  const cart = cartQuery.data;
  const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  if (!cart && cartQuery.isError) {
    return <main className="page-shell container"><Alert variant="danger" title="Cart unavailable"><p>{cartQuery.error.message}</p></Alert><Link className="btn btn-primary" to="/shop">Continue shopping</Link></main>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="page-shell">
        <header className="page-header container narrow"><p className="eyebrow">Your bag</p><h1>Shopping cart</h1></header>
        <div className="container"><EmptyState title="Your cart is empty" message="Find something you love and it will appear here." action={<Link className="btn btn-primary" to="/shop">Explore products</Link>} /></div>
      </main>
    );
  }

  const handleQuantity = (itemId: string, quantity: number) => updateItem.mutate({ itemId, quantity });
  const subtotal = cart.subtotal;
  const total = cart.total || subtotal + cart.tax + cart.shipping - cart.discount;

  return (
    <main className="page-shell">
      <header className="page-header container narrow">
        <p className="eyebrow">Your bag</p>
        <h1>Shopping cart</h1>
        <p className="page-subtitle">{itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout</p>
      </header>
      <div className="container cart-layout">
        <section className="cart-items" aria-label="Cart items">
          {cart.items.map((item) => (
            <article className="cart-item" key={item.id}>
              <Link className="cart-item-image" to={`/product/${item.productId}`}>
                <img src={item.product.images[0] || '/product-placeholder.svg'} alt={item.product.name} />
              </Link>
              <div className="cart-item-details">
                <div className="cart-item-title-row">
                  <div>
                    <p className="eyebrow">{item.product.brand}</p>
                    <h2><Link to={`/product/${item.productId}`}>{item.product.name}</Link></h2>
                    <p className="text-secondary text-sm">{item.product.sku}</p>
                  </div>
                  <button className="remove-button" type="button" onClick={() => removeItem.mutate(item.id)} aria-label={`Remove ${item.product.name}`}>×</button>
                </div>
                <div className="cart-item-controls">
                  <QuantitySelector value={item.quantity} onChange={(quantity) => handleQuantity(item.id, quantity)} max={Math.max(1, item.product.stockQuantity)} />
                  <strong>{formatMoney(item.product.price * item.quantity, cart.currency)}</strong>
                </div>
                {removeItem.isError && <p className="form-error">Unable to remove this item. Please try again.</p>}
              </div>
            </article>
          ))}
          <button className="btn btn-outline clear-cart" type="button" disabled={clearCart.isPending} onClick={() => clearCart.mutate()}>Clear cart</button>
        </section>
        <aside className="summary-card card">
          <div className="card-body">
            <h2>Order summary</h2>
            <dl className="summary-lines">
              <div><dt>Subtotal</dt><dd>{formatMoney(subtotal, cart.currency)}</dd></div>
              <div><dt>Shipping</dt><dd>{cart.shipping ? formatMoney(cart.shipping, cart.currency) : 'Calculated at checkout'}</dd></div>
              <div><dt>Tax</dt><dd>{cart.tax ? formatMoney(cart.tax, cart.currency) : 'Calculated at checkout'}</dd></div>
              {cart.discount > 0 && <div><dt>Discount</dt><dd>-{formatMoney(cart.discount, cart.currency)}</dd></div>}
            </dl>
            <div className="summary-total"><dt>Total</dt><dd>{formatMoney(total, cart.currency)}</dd></div>
            <Link className="btn btn-primary btn-block btn-lg checkout-button" to="/checkout">Proceed to checkout</Link>
            <Link className="continue-link" to="/shop">or continue shopping</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
