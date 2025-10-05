import { create } from "zustand";
import { Call } from "@/types";

interface CallStore {
  calls: Call[];
  liveCalls: Call[];
  selectedCall: Call | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCalls: (calls: Call[]) => void;
  setLiveCalls: (calls: Call[]) => void;
  addCall: (call: Call) => void;
  updateCall: (id: string, updates: Partial<Call>) => void;
  removeCall: (id: string) => void;
  setSelectedCall: (call: Call | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCalls: () => void;
}

export const useCallStore = create<CallStore>((set) => ({
  calls: [],
  liveCalls: [],
  selectedCall: null,
  isLoading: false,
  error: null,

  setCalls: (calls) =>
    set({ calls, isLoading: false }),

  setLiveCalls: (calls) =>
    set({ liveCalls: calls }),

  addCall: (call) =>
    set((state) => ({
      calls: [call, ...state.calls],
    })),

  updateCall: (id, updates) =>
    set((state) => ({
      calls: state.calls.map((call) =>
        call.id === id ? { ...call, ...updates } : call
      ),
      liveCalls: state.liveCalls.map((call) =>
        call.id === id ? { ...call, ...updates } : call
      ),
    })),

  removeCall: (id) =>
    set((state) => ({
      calls: state.calls.filter((call) => call.id !== id),
      liveCalls: state.liveCalls.filter((call) => call.id !== id),
    })),

  setSelectedCall: (call) =>
    set({ selectedCall: call }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error, isLoading: false }),

  clearCalls: () =>
    set({
      calls: [],
      liveCalls: [],
      selectedCall: null,
      error: null,
    }),
}));