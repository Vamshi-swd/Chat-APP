// store/store.js
import { create } from "zustand";

const useStore = create((set) => ({
  // Authentication state
  user: null,
  setUser: (user) => set({ user }),

  // Chat messages state
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));

export default useStore;
