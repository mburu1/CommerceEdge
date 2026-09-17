import { Link } from 'react-router-dom';
import { Badge, EmptyState } from '@/components';
import { useCustomer, useOrders } from '@/hooks';
import { formatMoney } from '@/lib/utils';
import type { OrderStatus } from '@/models';

const statusVariants: Record<OrderStatus, 'primary' | 'success' | 'warning' | 'secondary'> = {
  pending: 'warning',
  confirmed: 'primary',
  processing: 'primary',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'secondary',
  refunded: 'secondary',
};

export function OrdersPage() {
  const customerQuery = useCustomer();
  const ordersQuery = useOrders({ page: 1, limit: 10, status: undefined });
  const customer = customerQuery.data;
  const orders = ordersQuery.data?.data ?? [];

  return (
    <main className="page-shell">
      <header className="page-header container narrow"><p className="eyebrow">Purchase history</p><h1>My orders</h1><p className="page-subtitle">Track recent orders and revisit past purchases.</p></header>
      <div className="container account-layout">
        <aside className="account-nav card">
          <div className="account-user"><span>{customer ? `${customer.firstName[0]}${customer.lastName[0]}` : 'CE'}</span><div><strong>{customer ? `${customer.firstName} ${customer.lastName}` : 'Guest'}</strong><small>{customer?.email}</small></div></div>
          <nav aria-label="Account navigation"><Link to="/account">Profile</Link><Link className="active" to="/account/orders">Orders</Link><Link to="/account/addresses">Addresses</Link></nav>
        </aside>
        <section className="card account-content">
          <div className="card-header"><h2>Recent orders</h2><p>Your latest purchases at a glance.</p></div>
          <div className="card-body">
            {orders.length > 0 ? (
              <div className="orders-list">
                {orders.map((order) => (
                  <Link className="order-row" key={order.id} to={`/account/orders/${order.id}`}>
                    <div><span className="order-number">Order {order.orderNumber}</span><small>{new Date(order.createdAt).toLocaleDateString()}</small></div>
                    <div><span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span><strong>{formatMoney(order.total, order.currency)}</strong></div>
                    <Badge variant={statusVariants[order.status]}>{order.status}</Badge>
                    <span className="order-arrow" aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            ) : <EmptyState title="No orders yet" message="When you place an order, it will appear here." action={<Link className="btn btn-primary" to="/shop">Start shopping</Link>} />}
          </div>
        </section>
      </div>
    </main>
  );
}
