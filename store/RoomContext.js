'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const RoomContext = createContext({
  room: null,
  roomCode: 'LOJA',
  isLoading: true,
  isRoomAdmin: false,
  setRoomData: () => {},
  switchRoom: () => {},
  leaveRoom: () => {},
  verifyAdminPin: () => false,
});

export function RoomProvider({ children }) {
  const [room, setRoom] = useState(null);
  const [roomCode, setRoomCode] = useState('LOJA');
  const [isLoading, setIsLoading] = useState(true);
  const [isRoomAdmin, setIsRoomAdmin] = useState(false);

  const supabase = createClient();

  // Cargar sala activa al iniciar
  useEffect(() => {
    const savedCode = localStorage.getItem('ul_current_room') || 'LOJA';
    const savedPin = localStorage.getItem(`ul_admin_pin_${savedCode}`);
    loadRoom(savedCode, savedPin);
  }, []);

  const loadRoom = async (code, pin = null) => {
    setIsLoading(true);
    const cleanCode = (code || 'LOJA').trim().toUpperCase();

    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (data && !error) {
        setRoom(data);
        setRoomCode(data.code);
        localStorage.setItem('ul_current_room', data.code);

        // Actualizar último acceso para evitar que expire si está activa
        supabase
          .from('rooms')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', data.id)
          .then();

        // Verificar si el usuario guardó el PIN correcto
        const storedPin = pin || localStorage.getItem(`ul_admin_pin_${data.code}`);
        if (storedPin && storedPin === data.admin_pin) {
          setIsRoomAdmin(true);
        } else {
          setIsRoomAdmin(false);
        }
      } else {
        // Si no existe la sala buscada, fallback seguro a LOJA
        if (cleanCode !== 'LOJA') {
          loadRoom('LOJA');
          return;
        }
      }
    } catch (e) {
      console.error('Error cargando sala:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRoom = (newCode, pin = null) => {
    loadRoom(newCode, pin);
  };

  const leaveRoom = () => {
    localStorage.removeItem('ul_current_room');
    loadRoom('LOJA');
  };

  const verifyAdminPin = (inputPin) => {
    if (!room) return false;
    if (room.admin_pin === inputPin) {
      setIsRoomAdmin(true);
      localStorage.setItem(`ul_admin_pin_${room.code}`, inputPin);
      return true;
    }
    return false;
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        roomCode,
        isLoading,
        isRoomAdmin,
        switchRoom,
        leaveRoom,
        verifyAdminPin,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom debe ser usado dentro de un RoomProvider');
  }
  return context;
}
