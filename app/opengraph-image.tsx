import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const alt = 'Agentshive — The Open Registry for AI Agents';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a14 0%, #1e1b4b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
            }}
          >
            🐝
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, color: 'white' }}>
            Agentshive
          </div>
        </div>
        <div
          style={{
            fontSize: 40,
            color: '#c7d2fe',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          The Open Registry for AI Agents
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 26,
            color: '#818cf8',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 12,
            padding: '14px 28px',
            fontFamily: 'monospace',
          }}
        >
          discover · share · install in seconds
        </div>
        <div style={{ marginTop: 50, fontSize: 24, color: '#64748b' }}>
          agentshive.net
        </div>
      </div>
    ),
    { ...size }
  );
}
