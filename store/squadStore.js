import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const FORMATIONS = {
  'Fútbol 6 (2-2-1)': [
    { id: 'pos_1', name: 'DEL', top: '20%', left: '50%' },
    { id: 'pos_2', name: 'MED', top: '45%', left: '25%' },
    { id: 'pos_3', name: 'MED', top: '45%', left: '75%' },
    { id: 'pos_4', name: 'DEF', top: '75%', left: '25%' },
    { id: 'pos_5', name: 'DEF', top: '75%', left: '75%' },
    { id: 'pos_6', name: 'POR', top: '90%', left: '50%' },
  ],
  'Fútbol 6 (3-1-1)': [
    { id: 'pos_1', name: 'DEL', top: '20%', left: '50%' },
    { id: 'pos_2', name: 'MED', top: '45%', left: '50%' },
    { id: 'pos_3', name: 'DEF', top: '75%', left: '20%' },
    { id: 'pos_4', name: 'DEF', top: '70%', left: '50%' },
    { id: 'pos_5', name: 'DEF', top: '75%', left: '80%' },
    { id: 'pos_6', name: 'POR', top: '90%', left: '50%' },
  ],
  'Fútbol 6 (1-3-1)': [
    { id: 'pos_1', name: 'DEL', top: '20%', left: '50%' },
    { id: 'pos_2', name: 'MED', top: '45%', left: '20%' },
    { id: 'pos_3', name: 'MED', top: '45%', left: '50%' },
    { id: 'pos_4', name: 'MED', top: '45%', left: '80%' },
    { id: 'pos_5', name: 'DEF', top: '75%', left: '50%' },
    { id: 'pos_6', name: 'POR', top: '90%', left: '50%' },
  ],
  'Fútbol 6 (2-1-2)': [
    { id: 'pos_1', name: 'DEL', top: '20%', left: '30%' },
    { id: 'pos_2', name: 'DEL', top: '20%', left: '70%' },
    { id: 'pos_3', name: 'MED', top: '45%', left: '50%' },
    { id: 'pos_4', name: 'DEF', top: '75%', left: '25%' },
    { id: 'pos_5', name: 'DEF', top: '75%', left: '75%' },
    { id: 'pos_6', name: 'POR', top: '90%', left: '50%' },
  ],
  'Fútbol 6 (1-2-2)': [
    { id: 'pos_1', name: 'DEL', top: '20%', left: '30%' },
    { id: 'pos_2', name: 'DEL', top: '20%', left: '70%' },
    { id: 'pos_3', name: 'MED', top: '45%', left: '30%' },
    { id: 'pos_4', name: 'MED', top: '45%', left: '70%' },
    { id: 'pos_5', name: 'DEF', top: '75%', left: '50%' },
    { id: 'pos_6', name: 'POR', top: '90%', left: '50%' },
  ],
};

export const useSquadStore = create(
  persist(
    (set) => ({
      activeFormation: 'Fútbol 6 (2-2-1)',
      pitch: FORMATIONS['Fútbol 6 (2-2-1)'].map(pos => ({ ...pos, player: null })),
      
      setFormation: (formationName) => set((state) => {
        if (!FORMATIONS[formationName]) return state;
        const newPositions = FORMATIONS[formationName];
        
        // Try to keep as many players as possible by their index
        const newPitch = newPositions.map((pos, index) => {
          return {
            ...pos,
            player: state.pitch[index]?.player || null
          };
        });
        
        return { activeFormation: formationName, pitch: newPitch };
      }),
      
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
