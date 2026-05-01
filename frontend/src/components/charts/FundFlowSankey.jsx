import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';

export default function FundFlowSankey({ data }) {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <Sankey
          data={data}
          nodePadding={24}
          nodeWidth={12}
          linkCurvature={0.5}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}
