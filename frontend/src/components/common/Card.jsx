export default function Card({ title, action, children }) {
  return (
    <div className="card">
      {(title || action) && (
        <div className="card-header">
          <strong>{title}</strong>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
