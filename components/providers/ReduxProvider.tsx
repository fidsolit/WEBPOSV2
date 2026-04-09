"use client";

import { Provider } from "react-redux";
import { store, persistor } from "@/store";
import { ReactNode } from "react";
// Dynamic import for PersistGate to avoid SSR issues
let PersistGate: any = null;
if (typeof window !== "undefined") {
  // Only require redux-persist/integration/react on client
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PersistGate = require("redux-persist/integration/react").PersistGate;
}

export function ReduxProvider({ children }: { children: ReactNode }) {
  // Only wrap with PersistGate if window is defined (client-side) and persistor is available
  const isClient =
    typeof window !== "undefined" &&
    PersistGate &&
    typeof persistor !== "undefined";
  return (
    <Provider store={store}>
      {isClient ? (
        // persistor is guaranteed to be defined here
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <PersistGate loading={null} persistor={persistor as any}>
          {children}
        </PersistGate>
      ) : (
        children
      )}
    </Provider>
  );
}
