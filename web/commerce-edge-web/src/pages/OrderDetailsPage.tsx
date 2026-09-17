import { Link, useParams } from 'react-router-dom';
import { Badge, Breadcrumbs, EmptyState } from '@/components';
import { useOrder } from '@/hooks';
import { formatMoney } from '@/lib/utils';

export function OrderDetailsPage() {
  const { orderId = '' } = useParams();
  const { data: order } = useOrder(orderId);

  return (
    <main className="page-shell">
      <div className="container"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My account', href: '/account' }, { label: 'Orders', href: '/account/orders' }, { label: order?.orderNumber ?? 'Order details' }]} /></div>
      {order ? (
        <div className="container order-detail-layout">
          <section className="card order-detail-main">
            <div className="card-header"><div><p className="eyebrow">Order {order.orderNumber}</p><h1>Order details</h1></div><Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'secondary' : 'primary'}>{order.status}</Badge></div>
            <div className="card-body">
              <div className="order-detail-facts"><div><span>Placed</span><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div><div><span>Items</span><strong>{order.items.length}</strong></div><div><span>Total</span><strong>{formatMoney(order.total, order.currency)}</strong></div></div>
              <div className="order-lines">{order.items.map((item) => <div className="order-line" key={item.id}><img src={item.image || '/product-placeholder.svg'} alt="" /><span><strong>{item.name}</strong><small>{item.sku} · Qty {item.quantity}</small></span><b>{formatMoney(item.total, order.currency)}</b></div>)}</div>
              <div className="order-addresses"><div><h2>Shipping address</h2><p>{order.shippingAddress.addressLine1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />{order.shippingAddress.country}</p></div><div><h2>Payment</h2><p>{order.paymentMethod.brand ?? order.paymentMethod.type} {order.paymentMethod.last4 ? `ending in ${order.paymentMethod.last4}` : ''}</p></div></div>
            </div>
          </section>
          <aside className="card order-detail-aside"><div className="card-body"><h2>Need help?</h2><p>Our support team can help with changes, returns, and delivery questions.</p><Link className="btn btn-outline btn-block" to="/contact">Contact support</Link></div></aside>
        </div>
      ) : <div className="container"><EmptyState title="Order not found" message="The order may not exist or is not available in this account." action={<Link className="btn btn-primary" to="/account/orders">Back to orders</Link>} /></div>}
    </main>
  );
}
