import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      className="not-found-page"
      style={{ color: '#99ffd3', textAlign: 'center' }}
    >
      <div className="not-found-content">
        <div className="not-found-title" style={{ color: '#99ffd3' }}>
          There was a problem.
        </div>

        <p className="not-found-message" style={{ color: '#99ffd3' }}>
          We could not find the page you were looking for. It may have been
          deleted or moved. Please check the URL and try again.
        </p>

        <p className="not-found-message" style={{ color: '#99ffd3' }}>
          Go back to the{' '}
          <Link
            href="/"
            className="not-found-link"
            style={{ color: '#99ffd3' }}
          >
            main page
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
