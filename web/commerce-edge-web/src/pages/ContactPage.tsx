import { useState, type FormEvent } from 'react';
import { Alert, Button, Input, Textarea } from '@/components';

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="page-shell">
      <header className="page-header container narrow"><p className="eyebrow">We are here to help</p><h1>Contact CommerceEdge</h1><p className="page-subtitle">Questions about an order, product, or the platform? Send us a note.</p></header>
      <div className="container contact-layout">
        <aside className="contact-aside"><div><span className="contact-icon">✉</span><h2>Email</h2><p>support@commerceedge.example</p></div><div><span className="contact-icon">↗</span><h2>Response time</h2><p>We typically reply within one business day.</p></div></aside>
        <section className="card contact-form-card">
          <div className="card-body">
            {sent ? <Alert variant="success" title="Message sent"><p>Thanks for reaching out. We will be in touch soon.</p><Button variant="outline" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>Send another message</Button></Alert> : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-grid"><Input label="Name" value={form.name} onChange={(event) => update('name', event.target.value)} required /><Input label="Email address" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required /></div>
                <Input label="Subject" value={form.subject} onChange={(event) => update('subject', event.target.value)} required />
                <Textarea label="Message" rows={6} value={form.message} onChange={(event) => update('message', event.target.value)} required />
                <Button type="submit">Send message</Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
