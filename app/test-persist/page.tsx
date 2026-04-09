"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuth, clearAuth } from "@/store/slices/authSlice";

export default function TestPersistPage() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [localValue, setLocalValue] = useState<string | null>(null);

  useEffect(() => {
    const v =
      typeof window !== "undefined"
        ? localStorage.getItem("persist:root")
        : null;
    setLocalValue(v);
  }, []);

  const handleSet = () => {
    dispatch(
      setAuth({
        user: {
          id: "test",
          app_metadata: {},
          user_metadata: {},
          aud: "anon",
          email: "a@b.com",
        } as any,
        profile: { id: "p", role: "admin", is_active: true } as any,
        token: "abc",
      }),
    );
    setTimeout(() => {
      const v = localStorage.getItem("persist:root");
      setLocalValue(v);
    }, 500);
  };

  const handleClear = () => {
    dispatch(clearAuth());
    setTimeout(() => {
      const v = localStorage.getItem("persist:root");
      setLocalValue(v);
    }, 500);
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Redux Persist Test</h2>
      <div className="mb-4">
        Auth state: <pre>{JSON.stringify(auth, null, 2)}</pre>
      </div>
      <div className="mb-4">
        LocalStorage persist:root: <pre>{localValue}</pre>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSet}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Set Auth
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Clear Auth
        </button>
      </div>
    </div>
  );
}
