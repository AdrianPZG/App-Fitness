import Constants from 'expo-constants';

import { getAuthToken, useAuth } from '@/store/auth';

// En desarrollo usamos la IP de la PC que sirve Metro (la misma que ve el teléfono).
// En producción se define EXPO_PUBLIC_API_URL.
function baseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  return `http://${host}:8000`;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const res = await fetch(`${baseUrl()}/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (res.status === 401) useAuth.getState().signOut();
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export type Profile = {
  name: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  sex: 'M' | 'F' | null;
  goal: 'lose_weight' | 'gain_weight' | 'build_muscle' | 'stay_fit' | 'stay_active' | 'eat_better' | null;
  birth_year: number | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | null;
  equipment: 'home' | 'gym' | null;
  locale: string;
};

export type Exercise = {
  id: number;
  slug: string;
  name: string;
  muscle_groups: string[];
  equipment: string | null;
  level: string | null;
  images: string[];
  instructions: string[];
  locked: boolean;
};

export type Recipe = {
  id: number;
  slug: string;
  title: string;
  steps: string[];
  prep_min: number;
  tags: string[];
  portion: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  ingredients: { name: string; grams: number }[];
};

export type Menu = {
  date: string;
  target: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
  total: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
  meals: { meal: string; target_kcal: number; recipe: Recipe }[];
};

export const isComplete =(p?: Profile) =>
  !!(p?.height_cm && p.weight_kg && p.sex && p.goal && p.birth_year && p.activity_level && p.equipment);

export type PlanItem = { sets: number; reps: string | null; seconds: number | null; rest_s: number; exercise: Exercise };
export type PlanDay = { day: number; kind: string; exercises: PlanItem[] };
export type Plan = { goal: string; level: string; days_per_week: number; weekdays: number[]; equipment: string; days: PlanDay[] };

export type Macros = { kcal: number; protein_g: number; fat_g: number; carbs_g: number };
export type Nutrition = Macros & {
  goal: string;
  effective_goal: string;
  bmi: number;
  tdee: number;
  fiber_g: number;
  water_ml: number;
  meals: (Macros & { key: string })[];
  warnings: string[];
};
