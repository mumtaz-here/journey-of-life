/**
 * Journey of Life — Query Client (Stable + Persist)
 * -------------------------------------------------
 * - TanStack Query v5
 * - LocalStorage cache persist (offline-ready)
 * - Safe settings untuk low-end devices
 */

import {
  QueryClient,
  onlineManager,
  focusManager,
} from "@tanstack/react-query";

import {
  createSyncStoragePersister,
} from "@tanstack/query-sync-storage-persister";

import { persistQueryClient } from "@tanstack/query-persist-client-core";

/* ============================================================
   QUERY CLIENT — MAIN
============================================================ */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                // mengurangi spam error
      staleTime: 1000 * 30,    // 30 detik (lebih ringan)
      gcTime: 1000 * 60 * 60,  // 1 jam
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/* ============================================================
   NETWORK AWARENESS
============================================================ */
// otomatis pause query saat offline
onlineManager.setOnline(navigator.onLine);

window.addEventListener("online", () => onlineManager.setOnline(true));
window.addEventListener("offline", () => onlineManager.setOnline(false));

/* ============================================================
   PERSIST CLIENT (LOCALSTORAGE)
============================================================ */
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "JOL_QUERY_CACHE",
});

/* simpan cache secara otomatis */
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 6, // 6 jam cache
});
