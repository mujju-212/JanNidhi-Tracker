import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';

const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

const SankeyTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload || {};
  const source = item.source?.name || 'Finance Ministry';
  const target = item.target?.name || '-';
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #d5e2f6',
        boxShadow: '0 8px 16px rgba(30, 75, 140, 0.15)',
        padding: '8px 10px',
        fontSize: '12px',
        lineHeight: 1.5
      }}
    >
      <div style={{ color: '#1f2937', fontWeight: 600 }}>{source} to {target}</div>
      <div style={{ color: '#334155' }}>Allocation: {formatCrore(item.actualAmount)}</div>
      <div style={{ color: '#64748b' }}>Share: {item.shareLabel || `${Number(item.value || 0).toFixed(1)}%`}</div>
    </div>
  );
};

export default function FundFlowSankey({ data }) {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <Sankey
          data={data}
          nodePadding={36}
          nodeWidth={14}
          linkCurvature={0.45}
          iterations={64}
          node={{ fill: '#2f6fdc', stroke: '#2f6fdc', strokeWidth: 1 }}
          link={{ stroke: '#86b5ff', strokeOpacity: 0.35 }}
        >
          <Tooltip content={<SankeyTooltip />} />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}
