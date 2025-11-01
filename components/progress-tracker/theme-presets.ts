import { TrackerTheme } from './types';

export const trackerThemes: TrackerTheme[] = [
  {
    id: 'aurora-dawn',
    name: 'Aurora Dawn',
    description: 'Warm sunrise hues inspired by creative coworking lounges.',
    palette: {
      background: 'linear-gradient(135deg, #140024 0%, #3f1b5f 45%, #f88379 100%)',
      surface: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(248, 162, 189, 0.45)',
      textPrimary: '#FDF2F8',
      textSecondary: '#FBCFE8',
      accent: '#FB7185',
      glow: '0 18px 60px rgba(251, 113, 133, 0.35)',
    },
  },
  {
    id: 'midnight-metro',
    name: 'Midnight Metro',
    description: 'High-contrast neon perfect for late-night studio sprints.',
    palette: {
      background: 'linear-gradient(140deg, #05052f 0%, #0b1a4a 35%, #05c7f2 100%)',
      surface: 'rgba(9, 29, 71, 0.55)',
      border: 'rgba(5, 199, 242, 0.55)',
      textPrimary: '#E0F2FE',
      textSecondary: '#7DD3FC',
      accent: '#22D3EE',
      glow: '0 20px 70px rgba(34, 211, 238, 0.35)',
    },
  },
  {
    id: 'desert-lounge',
    name: 'Desert Lounge',
    description: 'Earthy neutrals balanced with cooling oasis accents.',
    palette: {
      background: 'linear-gradient(120deg, #2c1b12 0%, #5c3f34 45%, #c79d66 100%)',
      surface: 'rgba(255, 248, 240, 0.12)',
      border: 'rgba(255, 240, 230, 0.45)',
      textPrimary: '#FEF3C7',
      textSecondary: '#F5D0C5',
      accent: '#FCD34D',
      glow: '0 16px 55px rgba(252, 211, 77, 0.3)',
    },
  },
  {
    id: 'forest-atrium',
    name: 'Forest Atrium',
    description: 'Biophilic greens blended with fresh air neutrals.',
    palette: {
      background: 'linear-gradient(125deg, #031c13 0%, #0b4323 50%, #6bffb0 100%)',
      surface: 'rgba(13, 91, 55, 0.45)',
      border: 'rgba(107, 255, 176, 0.35)',
      textPrimary: '#ECFDF5',
      textSecondary: '#A7F3D0',
      accent: '#34D399',
      glow: '0 22px 70px rgba(16, 185, 129, 0.28)',
    },
  },
  {
    id: 'coastal-fog',
    name: 'Coastal Fog',
    description: 'Minimal slate & mist palette for quiet focus zones.',
    palette: {
      background: 'linear-gradient(145deg, #0b1220 0%, #1c2838 45%, #88a2c9 100%)',
      surface: 'rgba(203, 213, 225, 0.08)',
      border: 'rgba(148, 163, 184, 0.4)',
      textPrimary: '#F8FAFC',
      textSecondary: '#CBD5F5',
      accent: '#818CF8',
      glow: '0 25px 80px rgba(129, 140, 248, 0.35)',
    },
  },
];
