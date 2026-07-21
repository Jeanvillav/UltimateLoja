'use client';

import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function RadarChart({ stats }) {
  const data = [
    { subject: 'Ritmo (PAC)', A: stats.pace, fullMark: 100 },
    { subject: 'Tiro (SHO)', A: stats.shooting, fullMark: 100 },
    { subject: 'Pase (PAS)', A: stats.passing, fullMark: 100 },
    { subject: 'Regate (DRI)', A: stats.dribbling, fullMark: 100 },
    { subject: 'Defensa (DEF)', A: stats.defending, fullMark: 100 },
    { subject: 'Físico (PHY)', A: stats.physical, fullMark: 100 },
  ];

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Estadísticas" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
