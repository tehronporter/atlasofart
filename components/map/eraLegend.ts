// components/map/eraLegend.ts
// Era legend data shared between MapShell and the sidebar.
// Kept in its own file so it can be imported without pulling in the
// dynamically-loaded MapShell bundle.

export const ERA_LEGEND = [
  { label: 'Ancient',     color: '#818cf8', years: '< 1500 BCE' },
  { label: 'Classical',   color: '#a78bfa', years: '1500–500 BCE' },
  { label: 'Hellenistic', color: '#34d399', years: '500 BCE–500 CE' },
  { label: 'Medieval',    color: '#22d3ee', years: '500–1400' },
  { label: 'Renaissance', color: '#f59e0b', years: '1400–1700' },
  { label: 'Baroque',     color: '#fb923c', years: '1700–1900' },
  { label: 'Modern',      color: '#f87171', years: '1900+' },
];
