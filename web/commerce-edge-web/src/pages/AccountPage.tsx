import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components';
import { useCustomer, useLogout, useUpdateProfile } from '@/hooks';

export function AccountPage() {
  const customerQuery = useCustomer();
  const logout = useLogout();
  const updateProfile = useUpdateProfile();
  const customer = customerQuery.data;
  const [form, setForm] = useState({ firstName: customer?.firstName ?? '', lastName: customer?.lastName ?? '', email: customer?.email ?? '', phone: customer?.phone ?? '' });

  useEffect(() => {
    if (customer) setForm({ firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone ?? '' });
  }, [customer]);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfile.mutate({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone || undefined });
  };

  if (!customer && customerQuery.isError) {
    return <main className="page-shell container"><div className="empty-state"><h1>Account unavailable</h1><p>{customerQuery.error.message}</p><Link className="btn btn-primary" to="/login">Sign in</Link></div></main>;
  }

  return (
    <main className="page-shell">
      <header className="page-header container narrow"><p className="eyebrow">Your space</p><h1>My account</h1><p className="page-subtitle">Manage your profile and shopping preferences.</p></header>
      <div className="container account-layout">
        <aside className="account-nav card">
          <div className="account-user"><span>{customer ? `${customer.firstName[0]}${customer.lastName[0]}` : 'CE'}</span><div><strong>{customer ? `${customer.firstName} ${customer.lastName}` : 'Guest'}</strong><small>{customer?.email}</small></div></div>
          <nav aria-label="Account navigation"><Link className="active" to="/account">Profile</Link><Link to="/account/orders">Orders</Link><Link to="/account/addresses">Addresses</Link></nav>
          {customer && <Button variant="outline" className="account-nav-button" onClick={() => logout.mutate()}>Sign out</Button>}
        </aside>
        <section className="card account-content">
          <div className="card-header"><h2>Profile details</h2><p>Keep your contact information up to date.</p></div>
          <div className="card-body">
            {!customer ? <p>Sign in to manage your profile.</p> : (
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-grid"><Input label="First name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} required /><Input label="Last name" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} required /></div>
                <Input label="Email address" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
                <Input label="Phone number" type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
                {updateProfile.isError && <p className="form-error" role="alert">{updateProfile.error.message}</p>}
                {updateProfile.isSuccess && <p className="text-success" role="status">Profile updated successfully.</p>}
                <Button type="submit" loading={updateProfile.isPending}>Save changes</Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
