export default function Badge({ tone, label }) {
  return <span className={`badge ${tone}`}>{label}</span>;
}
