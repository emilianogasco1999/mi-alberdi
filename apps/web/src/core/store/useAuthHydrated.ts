'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from './auth.store';

/** true cuando el store persistido ya se rehidrató desde localStorage (evita falsos redirects). */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
