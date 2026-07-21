import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const POSITIONS = [
  { id: 'pos_1', name: 'DEL', top: '15%', left: '50%' }, // Delantero
  { id: 'pos_2', name: 'MED', top: '45%', left: '25%' }, // Medio Izq
  { id: 'pos_3', name: 'MED', top: '45%', left: '75%' }, // Medio Der
  { id: 'pos_4', name: 'DEF', top: '75%', left: '25%' }, // Def Izq
  { id: 'pos_5', name: 'DEF', top: '75%', left: '75%' }, // Def Der
  { id: 'pos_6', name: 'POR', top: '90%', left: '50%' }, // Portero
];

export const useSquadStore = create(
  persist(
    (set) => ({
      pitch: POSITIONS.map(pos => ({ ...pos, player: null })),
      
      assignPlayer: (positionId, player) => set((state) => ({
        pitch: state.pitch.map(pos => {
          // If the player is already somewhere else, remove them from that position
          if (pos.player?.id === player.id) {
            return { ...pos, player: null };
          }
          // Assign to new position
          if (pos.id === positionId) {
            return { ...pos, player };
          }
          return pos;
        })
      })),

      removePlayer: (positionId) => set((state) => ({
        pitch: state.pitch.map(pos => pos.id === positionId ? { ...pos, player: null } : pos)
      })),
      
      clearSquad: () => set((state) => ({
        pitch: state.pitch.map(pos => ({ ...pos, player: null }))
      }))
    }),
    {
      name: 'squad-storage',
    }
  )
);
