import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";

// Detect client vs server (Next.js SSR). We must not require browser storage on the server
const isClient = typeof window !== "undefined";

// Lazily load storage only on the client to avoid "failed to create sync storage" during SSR
let storage: any = null;
if (isClient) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  storage = require("redux-persist/lib/storage").default;
}

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
});

// Only create a persisted reducer on the client where storage is available
const reducer =
  isClient && storage
    ? persistReducer(
        { key: "root", version: 1, storage, whitelist: ["auth", "cart"] },
        rootReducer,
      )
    : rootReducer;

export const store = configureStore({
  // reducer can be either a plain rootReducer or a persisted reducer. Cast to any to
  // avoid TypeScript mismatch with PersistPartial during SSR.
  reducer: reducer as any,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          "auth/setUser",
          "auth/setAuth",
        ],
        // Ignore these paths in the state
        ignoredPaths: ["auth.user"],
      },
    }),
});

// Only create a persistor on the client. On the server export undefined so importing modules
// don't trigger storage creation.
export const persistor = isClient && storage ? persistStore(store) : undefined;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
