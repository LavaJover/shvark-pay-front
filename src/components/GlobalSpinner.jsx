import { useLoading } from '../contexts/LoadingContext';

export default function GlobalSpinner() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(255,255,255,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div className="spinner" />
      <style>
        {`
          .spinner {
            width: 48px;
            height: 48px;
            border: 5px solid #ccc;
            border-top: 5px solid #4a90e2;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
