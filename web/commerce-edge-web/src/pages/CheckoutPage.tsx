import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Input, Select } from '@/components';
import { useCart, useCreateOrder, useShippingMethods } from '@/hooks';
import type { Address, CheckoutData, PaymentMethod } from '@/models';

const initialAddress: Address = {
  id: 'temporary',
  type: 'shipping',
  firstName: '',
  lastName: '',
  company: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
  isDefault: false,
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const cartQuery = useCart();
  const shippingQuery = useShippingMethods();
  const createOrder = useCreateOrder();
  const [shipping, setShipping] = useState<Address>(initialAddress);
  const [billing, setBilling] = useState<Address>(initialAddress);
  const [sameAddress, setSameAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    id: 'card',
    type: 'credit_card',
    brand: 'Visa',
    last4: '4242',
    isDefault: true,
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const cart = cartQuery.data;

  const updateShipping = (field: keyof Address, value: string) => {
    setShipping((current) => ({ ...current, [field]: value }));
    if (sameAddress) setBilling((current) => ({ ...current, [field]: value, type: 'billing' }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart) return;
    const data: CheckoutData = {
      shippingAddress: shipping,
      billingAddress: sameAddress ? { ...shipping, id: 'billing', type: 'billing' } : billing,
      paymentMethod,
      shippingMethod,
    };
    createOrder.mutate(data, {
      onSuccess: (order) => navigate(`/checkout/success?order=${order.id}`, { replace: true }),
    });
  };

  if (!cart || cart.items.length === 0) {
    return <main className="page-shell container"><div className="empty-state"><h1>Your cart is empty</h1><p>Add a few things before heading to checkout.</p><Link className="btn btn-primary" to="/shop">Shop products</Link></div></main>;
  }

  return (
    <main className="page-shell">
      <header className="page-header container narrow"><p className="eyebrow">Secure checkout</p><h1>Complete your order</h1><p className="page-subtitle">Review your details and choose how to receive your order.</p></header>
      <div className="container checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-section">
            <div className="checkout-section-heading"><span>1</span><h2>Contact and shipping</h2></div>
            <div className="form-grid">
              <Input label="First name" value={shipping.firstName} onChange={(event) => updateShipping('firstName', event.target.value)} required autoComplete="given-name" />
              <Input label="Last name" value={shipping.lastName} onChange={(event) => updateShipping('lastName', event.target.value)} required autoComplete="family-name" />
            </div>
            <Input label="Email address" type="email" value={shipping.phone || ''} onChange={(event) => updateShipping('phone', event.target.value)} required autoComplete="email" helperText="We will send order updates to this address." />
            <Input label="Street address" value={shipping.addressLine1} onChange={(event) => updateShipping('addressLine1', event.target.value)} required autoComplete="address-line1" />
            <div className="form-grid">
              <Input label="City" value={shipping.city} onChange={(event) => updateShipping('city', event.target.value)} required autoComplete="address-level2" />
              <Input label="State / Province" value={shipping.state} onChange={(event) => updateShipping('state', event.target.value)} required autoComplete="address-level1" />
            </div>
            <div className="form-grid">
              <Input label="Postal code" value={shipping.postalCode} onChange={(event) => updateShipping('postalCode', event.target.value)} required autoComplete="postal-code" />
              <Input label="Country" value={shipping.country} onChange={(event) => updateShipping('country', event.target.value)} required autoComplete="country-name" />
            </div>
          </section>
          <section className="checkout-section">
            <div className="checkout-section-heading"><span>2</span><h2>Delivery method</h2></div>
            <div className="option-list">
              {(shippingQuery.data && shippingQuery.data.length > 0 ? shippingQuery.data : [{ id: 'standard', name: 'Standard delivery', description: '3–5 business days', price: 0, estimatedDays: '3–5 business days' }]).map((method) => (
                <label className={`option-card ${shippingMethod === method.id ? 'selected' : ''}`} key={method.id}>
                  <input type="radio" name="shipping-method" value={method.id} checked={shippingMethod === method.id} onChange={() => setShippingMethod(method.id)} />
                  <span><strong>{method.name}</strong><small>{method.description}</small></span>
                  <b>{method.price ? `$${method.price.toFixed(2)}` : 'Free'}</b>
                </label>
              ))}
            </div>
          </section>
          <section className="checkout-section">
            <div className="checkout-section-heading"><span>3</span><h2>Payment</h2></div>
            <div className="payment-card">
              <span className="payment-card-icon">V</span>
              <div><strong>Visa ending in 4242</strong><small>Secure test payment method</small></div>
              <span className="secure-label">Secure</span>
            </div>
            <Select label="Payment method" value={paymentMethod.type} onChange={(event) => setPaymentMethod((current) => ({ ...current, type: event.target.value as PaymentMethod['type'] }))} options={[{ value: 'credit_card', label: 'Credit card' }, { value: 'debit_card', label: 'Debit card' }, { value: 'paypal', label: 'PayPal' }]} />
          </section>
          <section className="checkout-section">
            <label className="checkbox-filter"><input type="checkbox" checked={sameAddress} onChange={(event) => setSameAddress(event.target.checked)} /><span>Billing address is the same as shipping</span></label>
            {!sameAddress && (
              <div className="form-grid">
                <Input label="Billing first name" value={billing.firstName} onChange={(event) => setBilling({ ...billing, firstName: event.target.value })} required />
                <Input label="Billing last name" value={billing.lastName} onChange={(event) => setBilling({ ...billing, lastName: event.target.value })} required />
                <Input label="Billing street address" value={billing.addressLine1} onChange={(event) => setBilling({ ...billing, addressLine1: event.target.value })} required />
                <Input label="Billing city" value={billing.city} onChange={(event) => setBilling({ ...billing, city: event.target.value })} required />
              </div>
            )}
          </section>
          {createOrder.isError && <Alert variant="danger" title="Order could not be placed"><p>{createOrder.error.message}</p></Alert>}
          <Button className="place-order-button" type="submit" loading={createOrder.isPending}>Place order</Button>
          <p className="checkout-note">By placing your order, you agree to the CommerceEdge terms and privacy policy.</p>
        </form>
        <aside className="checkout-summary card">
          <div className="card-body">
            <h2>In your cart</h2>
            <div className="checkout-items">
              {cart.items.map((item) => <div className="checkout-item" key={item.id}><img src={item.product.images[0] || '/product-placeholder.svg'} alt="" /><span><strong>{item.product.name}</strong><small>Qty {item.quantity}</small></span><b>{formatMoneyForDisplay(item.product.price * item.quantity, cart.currency)}</b></div>)}
            </div>
            <dl className="summary-lines">
              <div><dt>Subtotal</dt><dd>{formatMoneyForDisplay(cart.subtotal, cart.currency)}</dd></div>
              <div><dt>Shipping</dt><dd>{formatMoneyForDisplay(cart.shipping, cart.currency)}</dd></div>
              <div><dt>Tax</dt><dd>{formatMoneyForDisplay(cart.tax, cart.currency)}</dd></div>
            </dl>
            <div className="summary-total"><dt>Total</dt><dd>{formatMoneyForDisplay(cart.total || cart.subtotal + cart.tax + cart.shipping - cart.discount, cart.currency)}</dd></div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function formatMoneyForDisplay(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
