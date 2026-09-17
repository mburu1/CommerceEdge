import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Input } from '@/components';
import { useLogin } from '@/hooks';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ email, password, rememberMe: true }, { onSuccess: () => navigate('/account') });
  };

  return (
    <main className="page-shell auth-page">
      <div className="auth-card card">
        <div className="auth-copy"><p className="eyebrow">Welcome back</p><h1>Sign in to CommerceEdge</h1><p>Access your orders, addresses, and saved details.</p></div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          <div className="auth-options"><label className="checkbox-filter"><input type="checkbox" defaultChecked /><span>Remember me</span></label><Link to="/contact">Forgot password?</Link></div>
          {login.isError && <Alert variant="danger"><p>{login.error.message}</p></Alert>}
          <Button className="btn-block" type="submit" loading={login.isPending}>Sign in</Button>
          <p className="auth-switch">New to CommerceEdge? <Link to="/register">Create an account</Link></p>
        </form>
      </div>
    </main>
  );
}
