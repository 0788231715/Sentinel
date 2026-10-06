import { create } from 'zustand';
import { eventService, type EventRecord } from '../services/api/event.service';

export type EventItem = EventRecord;

interface EventStoreState {
  events: EventItem[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
}

export const useEventStore = create<EventStoreState>((set) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });

    try {
      const response = await eventService.getEvents();
      set({ events: response.events, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch events',
      });
    }
  },
}));
