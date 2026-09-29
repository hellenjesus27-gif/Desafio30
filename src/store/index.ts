import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Activity, Cardio, CardioType, Challenge, DayLog, Group, ISODate, NotificationPrefs, Rules, User, Workout, WorkoutType,
} from '../types';
import { buildSeed, DEMO_USER_ID } from '../data/seed';
import { todayISO } from '../utils/dates';

export type ThemePref = 'system' | 'light' | 'dark';

interface State {
  ready: boolean;
  themePref: ThemePref;
  currentUserId: string | null;
  users: User[];
  passwords: Record<string, string>; // apenas modo local/demo (hash simples). Em produção use Supabase Auth.
  groups: Group[];
  challenges: Challenge[];
  activeGroupId: string | null;
  workouts: Workout[];
  cardios: Cardio[];
  days: DayLog[];
  activities: Activity[];
  notif: NotificationPrefs;

  // auth
  register: (name: string, email: string, password: string, photo?: string) => string | null;
  login: (email: string, password: string) => string | null;
  loginDemo: () => void;
  logout: () => void;
  resetPassword: (email: string) => string | null;
  updateProfile: (p: Partial<Pick<User, 'name' | 'photo'>>) => void;
  setTheme: (t: ThemePref) => void;
  setNotif: (n: Partial<NotificationPrefs>) => void;

  // registros
  addWorkout: (type: WorkoutType, date?: ISODate, minutes?: number, note?: string) => void;
  removeWorkout: (id: string) => void;
  addCardio: (c: { type: CardioType; minutes: number; date: ISODate; time: string; note?: string; photo?: string }) => void;
  removeCardio: (id: string) => void;
  addWater: (ml: number, date?: ISODate) => void;
  resetWater: (date?: ISODate) => void;
  setHabit: (field: 'noSweets' | 'noAlcohol', value: boolean, date?: ISODate) => void;

  // social
  react: (activityId: string, emoji: Activity['reactions'][number]['emoji']) => void;
  comment: (activityId: string, text: string) => void;
  postActivity: (text: string) => void;

  // grupos
  createGroup: (name: string, photo?: string, durationDays?: number) => string;
  joinGroup: (code: string) => string | null;
  setActiveGroup: (id: string) => void;

  // admin
  updateRules: (challengeId: string, rules: Rules) => void;
  updateChallenge: (challengeId: string, patch: Partial<Pick<Challenge, 'name' | 'durationDays' | 'startDate'>>) => void;
  setChallengeStatus: (challengeId: string, status: Challenge['status']) => void;
  addMember: (groupId: string, name: string) => void;
  removeMember: (groupId: string, userId: string) => void;
}

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const hash = (s: string) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h); };
const genCode = () => 'D30-' + Math.random().toString(36).slice(2, 8).toUpperCase();

const emptyDay = (userId: string, date: ISODate): DayLog => ({ userId, date, waterMl: 0, noSweets: null, noAlcohol: null });

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const upsertDay = (date: ISODate, fn: (d: DayLog) => DayLog) => {
        const uidc = get().currentUserId;
        if (!uidc) return;
        const days = get().days;
        const idx = days.findIndex((d) => d.userId === uidc && d.date === date);
        if (idx >= 0) set({ days: days.map((d, i) => (i === idx ? fn(d) : d)) });
        else set({ days: [...days, fn(emptyDay(uidc, date))] });
      };
      const me = () => get().users.find((u) => u.id === get().currentUserId);
      const feed = (text: string) => {
        const u = get().currentUserId;
        if (!u) return;
        set({ activities: [{ id: uid('a'), userId: u, text, createdAt: new Date().toISOString(), reactions: [], comments: [] }, ...get().activities] });
      };

      return {
        ready: false,
        themePref: 'system',
        currentUserId: null,
        users: [], passwords: {}, groups: [], challenges: [], activeGroupId: null,
        workouts: [], cardios: [], days: [], activities: [],
        notif: { water: true, workout: true, cardio: true, sweets: true, alcohol: true, dailyClose: true },

        register: (name, email, password, photo) => {
          const e = email.trim().toLowerCase();
          if (!name.trim()) return 'Informe seu nome.';
          if (!/^\S+@\S+\.\S+$/.test(e)) return 'E-mail inválido.';
          if (password.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
          if (get().users.some((u) => u.email === e)) return 'Já existe uma conta com este e-mail.';
          const id = uid('u');
          set({
            users: [...get().users, { id, name: name.trim(), email: e, photo }],
            passwords: { ...get().passwords, [id]: hash(password) },
            currentUserId: id,
          });
          return null;
        },
        login: (email, password) => {
          const e = email.trim().toLowerCase();
          const u = get().users.find((x) => x.email === e);
          if (!u || get().passwords[u.id] !== hash(password)) return 'E-mail ou senha incorretos.';
          set({ currentUserId: u.id });
          return null;
        },
        loginDemo: () => {
          const s = buildSeed(todayISO());
          set({
            users: s.users, groups: [s.group], challenges: [s.challenge], activeGroupId: s.group.id,
            workouts: s.workouts, cardios: s.cardios, days: s.days, activities: s.activities,
            passwords: { [DEMO_USER_ID]: hash('123456') }, currentUserId: DEMO_USER_ID,
          });
        },
        logout: () => set({ currentUserId: null }),
        resetPassword: (email) => {
          const e = email.trim().toLowerCase();
          if (!/^\S+@\S+\.\S+$/.test(e)) return 'E-mail inválido.';
          // Modo local: apenas simula o envio. Com Supabase: supabase.auth.resetPasswordForEmail(e)
          return null;
        },
        updateProfile: (p) => set({ users: get().users.map((u) => (u.id === get().currentUserId ? { ...u, ...p } : u)) }),
        setTheme: (themePref) => set({ themePref }),
        setNotif: (n) => set({ notif: { ...get().notif, ...n } }),

        addWorkout: (type, date = todayISO(), minutes, note) => {
          const userId = get().currentUserId;
          if (!userId) return;
          set({ workouts: [...get().workouts, { id: uid('w'), userId, date, type, minutes, note }] });
          const n = get().workouts.filter((w) => w.userId === userId).length;
          if (n === 1) feed(`${me()?.name} registrou o primeiro treino 🏆`);
        },
        removeWorkout: (id) => set({ workouts: get().workouts.filter((w) => w.id !== id) }),
        addCardio: (c) => {
          const userId = get().currentUserId;
          if (!userId) return;
          set({ cardios: [...get().cardios, { id: uid('c'), userId, ...c }] });
          if (c.minutes >= 30) feed(`${me()?.name} fez ${c.minutes} min de ${c.type} 🏃`);
        },
        removeCardio: (id) => set({ cardios: get().cardios.filter((c) => c.id !== id) }),
        addWater: (ml, date = todayISO()) => {
          const goal = get().challenges[0]?.rules.waterGoalMl ?? 3000;
          let hit = false;
          upsertDay(date, (d) => {
            const waterMl = Math.max(0, d.waterMl + ml);
            hit = d.waterMl < goal && waterMl >= goal;
            return { ...d, waterMl };
          });
          if (hit) feed(`${me()?.name} bateu a meta de 3 L de água 💧`);
        },
        resetWater: (date = todayISO()) => upsertDay(date, (d) => ({ ...d, waterMl: 0 })),
        setHabit: (field, value, date = todayISO()) => upsertDay(date, (d) => ({ ...d, [field]: value })),

        react: (activityId, emoji) => {
          const userId = get().currentUserId;
          if (!userId) return;
          set({
            activities: get().activities.map((a) => {
              if (a.id !== activityId) return a;
              const has = a.reactions.some((r) => r.userId === userId && r.emoji === emoji);
              return { ...a, reactions: has ? a.reactions.filter((r) => !(r.userId === userId && r.emoji === emoji)) : [...a.reactions, { userId, emoji }] };
            }),
          });
        },
        comment: (activityId, text) => {
          const userId = get().currentUserId;
          if (!userId || !text.trim()) return;
          set({
            activities: get().activities.map((a) =>
              a.id === activityId ? { ...a, comments: [...a.comments, { id: uid('cm'), userId, text: text.trim(), createdAt: new Date().toISOString() }] } : a),
          });
        },
        postActivity: (text) => feed(text),

        createGroup: (name, photo, durationDays = 30) => {
          const userId = get().currentUserId!;
          const gid = uid('g'); const cid = uid('c');
          const rules = get().challenges[0]?.rules ?? buildSeed(todayISO()).challenge.rules;
          const challenge: Challenge = { id: cid, groupId: gid, name: 'Desafio 30', startDate: todayISO(), durationDays, status: 'active', rules };
          const group: Group = { id: gid, name: name.trim() || 'Meu grupo', photo, inviteCode: genCode(), adminId: userId, memberIds: [userId], challengeId: cid };
          set({ groups: [...get().groups, group], challenges: [...get().challenges, challenge], activeGroupId: gid });
          return gid;
        },
        joinGroup: (code) => {
          const userId = get().currentUserId!;
          const g = get().groups.find((x) => x.inviteCode.toLowerCase() === code.trim().toLowerCase());
          // Modo local: só encontra grupos existentes neste aparelho. Com backend, busca pelo código no servidor.
          if (!g) return 'Código de convite não encontrado.';
          if (g.memberIds.includes(userId)) { set({ activeGroupId: g.id }); return null; }
          set({ groups: get().groups.map((x) => (x.id === g.id ? { ...x, memberIds: [...x.memberIds, userId] } : x)), activeGroupId: g.id });
          return null;
        },
        setActiveGroup: (id) => set({ activeGroupId: id }),

        updateRules: (challengeId, rules) => set({ challenges: get().challenges.map((c) => (c.id === challengeId ? { ...c, rules } : c)) }),
        updateChallenge: (challengeId, patch) => set({ challenges: get().challenges.map((c) => (c.id === challengeId ? { ...c, ...patch } : c)) }),
        setChallengeStatus: (challengeId, status) =>
          set({ challenges: get().challenges.map((c) => (c.id === challengeId ? { ...c, status, ...(status === 'active' && c.status === 'draft' ? { startDate: todayISO() } : {}) } : c)) }),
        addMember: (groupId, name) => {
          const id = uid('u');
          set({
            users: [...get().users, { id, name: name.trim(), email: `${id}@convidado.local` }],
            groups: get().groups.map((g) => (g.id === groupId ? { ...g, memberIds: [...g.memberIds, id] } : g)),
          });
        },
        removeMember: (groupId, userId) =>
          set({ groups: get().groups.map((g) => (g.id === groupId ? { ...g, memberIds: g.memberIds.filter((m) => m !== userId) } : g)) }),
      };
    },
    {
      name: 'desafio30-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => useStore.setState({ ready: true }),
      partialize: (s) => ({ ...s, ready: undefined }) as State,
    },
  ),
);

