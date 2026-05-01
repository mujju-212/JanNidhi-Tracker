const legend = [
  { label: '> 3 L Cr', color: '#2563eb' },
  { label: '1 - 3 L Cr', color: '#3b82f6' },
  { label: '50 K Cr - 1 L Cr', color: '#60a5fa' },
  { label: '10 K Cr - 50 K Cr', color: '#93c5fd' },
  { label: '< 10 K Cr', color: '#cfe4ff' }
];

const mapCells = [
  { x: 20, y: 20, w: 34, h: 26, fill: '#2563eb' },
  { x: 58, y: 24, w: 30, h: 26, fill: '#3b82f6' },
  { x: 92, y: 30, w: 30, h: 26, fill: '#60a5fa' },
  { x: 126, y: 40, w: 30, h: 26, fill: '#93c5fd' },
  { x: 36, y: 52, w: 38, h: 26, fill: '#60a5fa' },
  { x: 78, y: 60, w: 34, h: 26, fill: '#2563eb' },
  { x: 118, y: 68, w: 30, h: 26, fill: '#3b82f6' },
  { x: 46, y: 84, w: 36, h: 26, fill: '#93c5fd' },
  { x: 86, y: 90, w: 34, h: 26, fill: '#60a5fa' },
  { x: 122, y: 96, w: 30, h: 26, fill: '#cfe4ff' },
  { x: 70, y: 118, w: 34, h: 26, fill: '#3b82f6' },
  { x: 102, y: 132, w: 30, h: 26, fill: '#60a5fa' },
  { x: 86, y: 158, w: 32, h: 26, fill: '#93c5fd' },
  { x: 106, y: 186, w: 30, h: 26, fill: '#cfe4ff' }
];

export default function IndiaMapPanel() {
  return (
    <div className="map-panel">
      <svg className="india-map" viewBox="0 0 180 230">
        {mapCells.map((cell, index) => (
          <rect
            key={index}
            x={cell.x}
            y={cell.y}
            width={cell.w}
            height={cell.h}
            rx="6"
            fill={cell.fill}
          />
        ))}
      </svg>
      <div className="legend">
        {legend.map((item) => (
          <div key={item.label} className="legend-item">
            <span className="legend-swatch" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
