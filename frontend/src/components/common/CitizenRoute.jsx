import { Navigate, useLocation } from 'react-router-dom';

const hasCitizenToken = () => {
  try {
    return Boolean(localStorage.getItem('jn_citizen_token'));
  } catch {
    return false;
  }
};

export default function CitizenRoute({ children }) {
  const location = useLocation();

  if (!hasCitizenToken()) {
    return <Navigate to="/public/citizen-login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
