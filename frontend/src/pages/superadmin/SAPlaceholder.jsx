import { useParams } from 'react-router-dom';

export default function SAPlaceholder() {
  const { section } = useParams();

  return (
    <div className="card">
      <h3 style={{ marginBottom: '8px' }}>Section in progress</h3>
      <p className="helper">
        {section ? section.replace('-', ' ') : 'This section'} is planned in the
        next build.
      </p>
    </div>
  );
}
