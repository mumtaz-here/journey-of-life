import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import {
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  PersistQueryClientProvider,
} from "@tanstack/query-persist-client-core";

import {
  createSyncStoragePersister,
} from "@tanstack/query-sync-storage-persister";

import { queryClient } from "./lib/query-client.js";

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <App />
    </PersistQueryClientProvider>
  </React.StrictMode>
);
