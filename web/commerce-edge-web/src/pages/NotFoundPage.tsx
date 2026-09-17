import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="page-shell">
      <section className="not-found container narrow">
        <span>404</span>
        <h1>This page moved or does not exist.</h1>
        <p>Let us help you find your way back to the collection.</p>
        <Link className="btn btn-primary btn-lg" to="/">Return home</Link>
      </section>
    </main>
  );
}
