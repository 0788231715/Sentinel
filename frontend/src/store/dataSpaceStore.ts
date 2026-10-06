import { create } from 'zustand';

export type DataSpace = 'simulation' | 'real';

const storageKey = 'sentinel.dataSpace';

function initialSpace(): DataSpace {
  return localStorage.getItem(storageKey) === 'real' ? 'real' : 'simulation';
}

interface DataSpaceState {
  space: DataSpace;
  setSpace: (space: DataSpace) => void;
}

export const useDataSpaceStore = create<DataSpaceState>((set) => ({
  space: initialSpace(),
  setSpace: (space) => {
    localStorage.setItem(storageKey, space);
    set({ space });
  },
}));
