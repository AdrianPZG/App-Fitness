import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

/**
 * Marca local (solo en este teléfono) de ejercicios completados, por clave
 * "día-ejercicio". No se sincroniza con el backend: sirve para tachar lo que
 * ya hiciste durante la sesión de hoy, no como historial de entrenamiento.
 */
const KEY = 'workout-log-done';

type WorkoutLogState = {
  ids: string[];
  load: () => Promise<void>;
  toggle: (id: string) => void;
  done: (id: string) => boolean;
};

export const useWorkoutLog = create<WorkoutLogState>((set, get) => ({
  ids: [],
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ ids: JSON.parse(raw) });
    } catch {}
  },
  toggle: (id) => {
    const next = get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id];
    set({ ids: next });
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  },
  done: (id) => get().ids.includes(id),
}));
