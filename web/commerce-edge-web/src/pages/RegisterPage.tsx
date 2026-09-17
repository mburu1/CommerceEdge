import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Input } from '@/components';
import { useRegister } from '@/hooks';

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    register.mutate(form, { onSuccess: () => navigate('/account') });
  };

  return (
    <main className="page-shell auth-page">
      <div className="auth-card card">
        <div className="auth-copy"><p className="eyebrow">Join CommerceEdge</p><h1>Create your account</h1><p>Save your details and make your next purchase even easier.</p></div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid"><Input label="First name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} required autoComplete="given-name" /><Input label="Last name" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} required autoComplete="family-name" /></div>
          <Input label="Email address" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} required minLength={8} autoComplete="new-password" helperText="Use at least 8 characters." />
          {register.isError && <Alert variant="danger"><p>{register.error.message}</p></Alert>}
          <Button className="btn-block" type="submit" loading={register.isPending}>Create account</Button>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </main>
  );
}
