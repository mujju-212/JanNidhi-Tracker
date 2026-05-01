export default function StatCard({ title, value, sub, icon: Icon, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: accent }}>
        {Icon ? <Icon size={18} /> : null}
      </div>
      <div className="stat-meta">
        <h3>{title}</h3>
        <strong>{value}</strong>
        {sub ? <span>{sub}</span> : null}
      </div>
    </div>
  );
}
