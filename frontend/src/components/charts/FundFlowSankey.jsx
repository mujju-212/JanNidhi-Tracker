import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';

export default function FundFlowSankey({ data }) {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <Sankey
          data={data}
          nodePadding={24}
          nodeWidth={14}
          linkCurvature={0.45}
          node={{ fill: '#2f6fdc', stroke: '#2f6fdc', strokeWidth: 1 }}
          link={{ stroke: '#86b5ff', strokeOpacity: 0.35 }}
        >
          <Tooltip
            contentStyle={{
              borderRadius: '10px',
              border: '1px solid #d5e2f6',
              boxShadow: '0 8px 16px rgba(30, 75, 140, 0.15)'
            }}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}
