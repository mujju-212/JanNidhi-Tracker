import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  const hasCitizenToken = (() => {
    try {
      return Boolean(localStorage.getItem('jn_citizen_token'));
    } catch {
      return false;
    }
  })();

  const handleCitizenLogout = () => {
    localStorage.removeItem('jn_citizen_token');
    window.location.href = '/public';
  };

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
            {hasCitizenToken ? <Link to="/public/citizen-dashboard">My Benefits</Link> : <Link to="/public/citizen-login">Citizen Login</Link>}
            {hasCitizenToken ? <button type="button" className="btn secondary" onClick={handleCitizenLogout}>Logout</button> : null}
          </nav>
        </div>
      </header>
      <main style={{ padding: '28px 32px' }}>
        <Outlet />
      </main>
    </div>
  );
}
