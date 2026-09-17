import type { ReactNode } from 'react';
import { Alert } from './Alert';
import { Spinner } from './Spinner';

interface LoadingStateProps {
  label?: string;
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

interface EmptyStateProps {
  title: string;
  message: string;
  action?: ReactNode;
}

export function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="state-view" role="status">
      <Spinner size="lg" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert variant="danger" title="Something went wrong" onDismiss={undefined}>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm mt-3" onClick={onRetry} type="button">
          Try again
        </button>
      )}
    </Alert>
  );
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
