import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: '60px' }}>
      <h2>Page not found</h2>
      <p className="helper">The page you are looking for does not exist.</p>
      <Link className="btn" to="/login">
        Back to Login
      </Link>
    </div>
  );
}
