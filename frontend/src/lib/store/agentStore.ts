import { create } from "zustand";
import { Agent } from "@/types";

interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  toggleAgentStatus: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAgents: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  selectedAgent: null,
  isLoading: false,
  error: null,

  setAgents: (agents) =>
    set({ agents, isLoading: false }),

  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, ...updates } : agent
      ),
    })),

  deleteAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
    })),

  setSelectedAgent: (agent) =>
    set({ selectedAgent: agent }),

  toggleAgentStatus: (id) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, isActive: !agent.isActive } : agent
      ),
    })),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error, isLoading: false }),

  clearAgents: () =>
    set({
      agents: [],
      selectedAgent: null,
      error: null,
    }),
}));