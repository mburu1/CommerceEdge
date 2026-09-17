import { Link, useSearchParams } from 'react-router-dom';
import { useOrder } from '@/hooks';

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order') ?? '';
  const { data: order } = useOrder(orderId);

  return (
    <main className="page-shell">
      <section className="success-page container narrow">
        <div className="success-icon" aria-hidden="true">✓</div>
        <p className="eyebrow">Order confirmed</p>
        <h1>Thank you for your order.</h1>
        <p>{order ? `Your order ${order.orderNumber} is being prepared.` : 'Your order has been received and is being prepared.'}</p>
        <div className="success-actions">
          <Link className="btn btn-primary" to="/account/orders">View order history</Link>
          <Link className="btn btn-outline" to="/shop">Continue shopping</Link>
        </div>
      </section>
    </main>
  );
}
