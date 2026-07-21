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
      
      assignPlayer: (positionId, player) => set((state) => {
        let newPitch = [...state.pitch];
        
        // Find if player is already on the pitch
        const existingPosIndex = newPitch.findIndex(pos => pos.player?.id === player.id);
        
        // Find the target position
        const targetPosIndex = newPitch.findIndex(pos => pos.id === positionId);
        if (targetPosIndex === -1) return state;

        // If the player is already on the pitch, we swap or move
        if (existingPosIndex !== -1) {
          // Player moving to a new spot. Get the player currently at the target spot (if any)
          const playerAtTarget = newPitch[targetPosIndex].player;
          
          // Move the active player to target
          newPitch[targetPosIndex] = { ...newPitch[targetPosIndex], player };
          // Move the player at target to the active player's old spot (Swap)
          newPitch[existingPosIndex] = { ...newPitch[existingPosIndex], player: playerAtTarget };
        } else {
          // New player from sidebar
          newPitch[targetPosIndex] = { ...newPitch[targetPosIndex], player };
        }

        return { pitch: newPitch };
      }),

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
