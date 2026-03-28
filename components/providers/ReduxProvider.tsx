'use client'


import { Provider } from 'react-redux'
import { store, persistor } from '@/store'
import { ReactNode, useEffect, useState } from 'react'
// Dynamic import for PersistGate to avoid SSR issues
let PersistGate: any = null;
if (typeof window !== 'undefined') {
  // Only require redux-persist/integration/react on client
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PersistGate = require('redux-persist/integration/react').PersistGate;
}

export function ReduxProvider({ children }: { children: ReactNode }) {
  // Only wrap with PersistGate if window is defined (client-side)
  const isClient = typeof window !== 'undefined' && PersistGate;
  return (
    <Provider store={store}>
      {isClient ? (
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      ) : (
        children
      )}
    </Provider>
  );
}

