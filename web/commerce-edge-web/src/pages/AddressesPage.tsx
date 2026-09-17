import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyState, Input } from '@/components';
import { useAddresses, useCreateAddress } from '@/hooks';
import type { Address } from '@/models';

const emptyAddress: Omit<Address, 'id'> = {
  type: 'shipping',
  firstName: '',
  lastName: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  isDefault: false,
};

export function AddressesPage() {
  const addressesQuery = useAddresses();
  const createAddress = useCreateAddress();
  const [form, setForm] = useState(emptyAddress);
  const addresses = addressesQuery.data ?? [];
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createAddress.mutate(form);
  };

  return (
    <main className="page-shell">
      <header className="page-header container narrow"><p className="eyebrow">Account</p><h1>Addresses</h1><p className="page-subtitle">Save the places where you like to receive your orders.</p></header>
      <div className="container account-layout">
        <aside className="account-nav card">
          <div className="account-user"><span>CE</span><div><strong>My account</strong><small>CommerceEdge customer</small></div></div>
          <nav aria-label="Account navigation"><Link to="/account">Profile</Link><Link to="/account/orders">Orders</Link><Link className="active" to="/account/addresses">Addresses</Link></nav>
        </aside>
        <section className="card account-content">
          <div className="card-header"><h2>Saved addresses</h2><p>Your default address is used at checkout.</p></div>
          <div className="card-body">
            {addresses.length > 0 ? (
              <div className="address-list">{addresses.map((address) => <article className="address-card" key={address.id}><div><span>{address.isDefault ? 'Default' : address.type}</span><h3>{address.firstName} {address.lastName}</h3><p>{address.addressLine1}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}</p></div>{address.isDefault && <strong>Default</strong>}</article>)}</div>
            ) : <EmptyState title="No saved addresses" message="Add an address to make checkout faster." />}
            <form className="address-form" onSubmit={handleSubmit}>
              <h2>Add a new address</h2>
              <div className="form-grid"><Input label="First name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} required /><Input label="Last name" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} required /></div>
              <Input label="Street address" value={form.addressLine1} onChange={(event) => update('addressLine1', event.target.value)} required />
              <div className="form-grid"><Input label="City" value={form.city} onChange={(event) => update('city', event.target.value)} required /><Input label="State / Province" value={form.state} onChange={(event) => update('state', event.target.value)} required /></div>
              <div className="form-grid"><Input label="Postal code" value={form.postalCode} onChange={(event) => update('postalCode', event.target.value)} required /><Input label="Country" value={form.country} onChange={(event) => update('country', event.target.value)} required /></div>
              <label className="checkbox-filter"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} /><span>Set as default address</span></label>
              {createAddress.isError && <p className="form-error" role="alert">{createAddress.error.message}</p>}
              <Button type="submit" loading={createAddress.isPending}>Save address</Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
