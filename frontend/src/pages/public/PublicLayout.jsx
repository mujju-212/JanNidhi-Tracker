import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div>
      <header style={{ padding: '16px 32px', background: '#ffffff', borderBottom: '1px solid #e5eaf2' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3>JanNidhi Tracker</h3>
            <p className="helper">Public transparency portal</p>
          </div>
          <nav style={{ display: 'flex', gap: '16px' }}>
            <Link to="/public">Home</Link>
            <Link to="/public/explore">Explore</Link>
            <Link to="/public/schemes">Schemes</Link>
            <Link to="/public/verify">Verify</Link>
            <Link to="/public/citizen-login">Citizen Login</Link>
          </nav>
        </div>
      </header>
      <main style={{ padding: '28px 32px' }}>
        <Outlet />
      </main>
    </div>
  );
}
