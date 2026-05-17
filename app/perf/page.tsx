// Server Component — reads from Neon directly, no client JS
import { getP75Vitals } from '@/lib/vitals-db';

function formatValue(name: string, value: number): string {
  if (name === 'CLS') return value.toFixed(3);
  return `${Math.round(value)}ms`;
}

function getRatingColor(rating: string): string {
  return rating === 'good'
    ? 'color: var(--color-text-success)'
    : rating === 'poor'
      ? 'color: var(--color-text-danger)'
      : 'color: var(--color-text-warning)';
}

export default async function PerfPage() {
  const vitals = await getP75Vitals();

  return (
    <main style={{ padding: '2rem', maxWidth: '640px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '1.5rem' }}>Field vitals — P75, last 7 days</h1>

      {vitals.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>No data yet. Visit a few pages to generate vitals.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 500 }}>Metric</th>
              <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 500 }}>P75</th>
              <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 500 }}>Rating</th>
              <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 500 }}>Samples</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map(v => (
              <tr key={v.name} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)' }}>{v.name}</td>
                <td style={{ textAlign: 'right', padding: '10px 0', fontWeight: 500 }}>{formatValue(v.name, v.p75)}</td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '10px 0',
                    ...{ style: getRatingColor(v.rating) },
                  }}
                >
                  <span style={getRatingColor(v.rating) as unknown as React.CSSProperties}>{v.rating}</span>
                </td>
                <td style={{ textAlign: 'right', padding: '10px 0', color: 'var(--color-text-tertiary)' }}>
                  {v.sampleCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
        Targets: LCP &lt; 2500ms · INP &lt; 200ms · CLS &lt; 0.1
      </p>
    </main>
  );
}
