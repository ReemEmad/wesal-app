import {
  getWesalMe,
  logoutWesal,
  setAuthTokenGetter,
  type AuthSession,
  type WesalUser,
  type CareInvitation,
  type InvitationInput,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Linking, Platform } from 'react-native';

const SESSION_KEY = 'wesal.session';
const PENDING_KEY = 'wesal.pendingInvite';
const DEMO_KEY = 'wesal.demo';
type DemoData = { user: WesalUser; invitations: CareInvitation[] };
const isWeb = Platform.OS === 'web';

async function readItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return typeof window === 'undefined' ? null : window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function writeItem(key: string, value: string) {
  if (isWeb) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Storage may be unavailable in private modes; the in-memory value still works.
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string) {
  if (isWeb) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

const TOKEN_PATTERN = /^[A-Za-z0-9._~-]{8,256}$/;

/** Extracts an invitation secret from wesal://invite?token=, /#invite= or /?invite= links. */
export function parseInviteToken(url: string | null | undefined): string | null {
  if (!url) return null;
  const direct = url.match(/[?#&]invite=([^&#]+)/);
  const scheme = /^wesal:\/\/invite/i.test(url) ? url.match(/[?&]token=([^&#]+)/) : null;
  const raw = direct?.[1] ?? scheme?.[1];
  if (!raw) return null;
  let token = raw;
  try {
    token = decodeURIComponent(raw);
  } catch {
    return null;
  }
  return TOKEN_PATTERN.test(token) ? token : null;
}

/** Captures an invite secret from the browser address and removes it from history. */
function captureWebInvite(): string | null {
  if (!isWeb || typeof window === 'undefined') return null;
  const { hash, search, pathname } = window.location;
  const token = parseInviteToken(hash) ?? parseInviteToken(search);
  if (hash.includes('invite=') || search.includes('invite=')) {
    try {
      window.history.replaceState(null, '', pathname || '/');
    } catch {
      // ignore
    }
  }
  return token;
}

/** Builds a share link without placing the secret in a server-visible path or query. */
export function buildInviteLink(token: string): { url: string; requiresApp: boolean } {
  const encoded = encodeURIComponent(token);
  if (isWeb && typeof window !== 'undefined') {
    return { url: `${window.location.origin}/#invite=${encoded}`, requiresApp: false };
  }
  const appUrl = process.env.EXPO_PUBLIC_APP_URL;
  if (appUrl) {
    return { url: `${appUrl.replace(/\/+$/, '')}/#invite=${encoded}`, requiresApp: false };
  }
  return { url: `wesal://invite?token=${encoded}`, requiresApp: true };
}

type ApiLikeError = { status?: number; data?: unknown };

export function errorStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as ApiLikeError).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}

export function errorMessage(error: unknown, fallback = 'حدث خطأ غير متوقع. حاول مرة أخرى.') {
  const status = errorStatus(error);
  if (status === undefined) {
    return 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.';
  }
  const data = (error as ApiLikeError).data;
  if (data && typeof data === 'object' && 'error' in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (status >= 500) return 'الخادم غير متاح الآن. حاول مرة أخرى بعد قليل.';
  return fallback;
}

type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'unreachable';
export type EntryHint = 'register' | 'login' | null;

type AuthContextValue = {
  isDemo: boolean;
  demoInvitations: CareInvitation[];
  startDemo: (name?: string, phone?: string, email?: string, hint?: Exclude<EntryHint, null>) => Promise<void>;
  createDemoInvitation: (input: InvitationInput) => Promise<CareInvitation>;
  revokeDemoInvitation: (id: string) => Promise<void>;
  status: AuthStatus;
  user: WesalUser | null;
  entryHint: EntryHint;
  pendingInvite: string | null;
  pendingReady: boolean;
  signIn: (session: AuthSession, hint: EntryHint) => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => void;
  setPendingInvite: (token: string) => Promise<void>;
  clearPendingInvite: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const tokenRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<WesalUser | null>(null);
  const [entryHint, setEntryHint] = useState<EntryHint>(null);
  const [pendingInvite, setPending] = useState<string | null>(null);
  const [pendingReady, setPendingReady] = useState(false);
  const [demo, setDemo] = useState<DemoData | null>(null);
  const demoRef = useRef<DemoData | null>(null);

  const saveDemo = useCallback(async (data: DemoData) => {
    demoRef.current = data;
    setDemo(data);
    await writeItem(DEMO_KEY, JSON.stringify(data)).catch(() => undefined);
  }, []);

  const startDemo = useCallback(async (
    name?: string,
    phone?: string,
    email?: string,
    hint: Exclude<EntryHint, null> = 'register',
  ) => {
    const demoUser: WesalUser = {
      id: 'local-demo-user',
      name: name?.trim() || 'مستخدم تجريبي',
      phone: phone?.trim() || 'غير محدد',
      email: email?.trim() || null,
      phoneVerified: false,
    };
    tokenRef.current = null;
    userIdRef.current = null;
    queryClient.clear();
    await saveDemo({ user: demoUser, invitations: [] });
    setUser(demoUser);
    setEntryHint(hint);
    setStatus('signedIn');
  }, [queryClient, saveDemo]);

  const createDemoInvitation = useCallback(async (input: InvitationInput) => {
    const current = demoRef.current;
    if (!current) throw new Error('Demo mode is not active.');
    const now = new Date();
    const invitation: CareInvitation = {
      ...input, id: `demo-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      caregiverName: current.user.name, status: 'pending',
      createdAt: now.toISOString(), expiresAt: new Date(+now + 7 * 86400_000).toISOString(),
    };
    await saveDemo({ ...current, invitations: [invitation, ...current.invitations] });
    return invitation;
  }, [saveDemo]);

  const revokeDemoInvitation = useCallback(async (id: string) => {
    const current = demoRef.current;
    if (!current) return;
    await saveDemo({ ...current, invitations: current.invitations.map((i) =>
      i.id === id ? { ...i, status: 'revoked' as const } : i) });
  }, [saveDemo]);

  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    return () => setAuthTokenGetter(null);
  }, []);

  const setPendingInvite = useCallback(async (token: string) => {
    setPending(token);
    try {
      await writeItem(PENDING_KEY, token);
    } catch {
      // In-memory value still drives the flow.
    }
  }, []);

  const clearPendingInvite = useCallback(async () => {
    setPending(null);
    try {
      await removeItem(PENDING_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Pending invitation: incoming link wins over a stored one.
  useEffect(() => {
    let active = true;
    (async () => {
      let incoming = captureWebInvite();
      if (!incoming && !isWeb) {
        try {
          incoming = parseInviteToken(await Linking.getInitialURL());
        } catch {
          incoming = null;
        }
      }
      let stored: string | null = null;
      try {
        stored = await readItem(PENDING_KEY);
      } catch {
        stored = null;
      }
      if (!active) return;
      if (incoming) await setPendingInvite(incoming);
      else if (stored) setPending(stored);
      setPendingReady(true);
    })();

    const sub = Linking.addEventListener('url', ({ url }) => {
      const token = parseInviteToken(url);
      if (token) void setPendingInvite(token);
    });
    const onHash = () => {
      const token = captureWebInvite();
      if (token) void setPendingInvite(token);
    };
    if (isWeb && typeof window !== 'undefined') window.addEventListener('hashchange', onHash);
    return () => {
      active = false;
      sub.remove();
      if (isWeb && typeof window !== 'undefined') window.removeEventListener('hashchange', onHash);
    };
  }, [setPendingInvite]);

  const checkSession = useCallback(async () => {
    try {
      const savedDemo = await readItem(DEMO_KEY);
      if (savedDemo) {
        const restored = JSON.parse(savedDemo) as DemoData;
        if (restored.user?.id === 'local-demo-user' && Array.isArray(restored.invitations)) {
          tokenRef.current = null;
          demoRef.current = restored;
          setDemo(restored);
          setUser(restored.user);
          setEntryHint(null);
          setStatus('signedIn');
          return;
        }
      }
    } catch {
      await removeItem(DEMO_KEY).catch(() => undefined);
    }
    let saved: string | null = null;
    try {
      saved = await readItem(SESSION_KEY);
    } catch {
      saved = null;
    }
    if (!saved) {
      tokenRef.current = null;
      setStatus('signedOut');
      return;
    }
    tokenRef.current = saved;
    try {
      const me = await getWesalMe();
      userIdRef.current = me.id;
      setUser(me);
      setStatus('signedIn');
    } catch (error) {
      const code = errorStatus(error);
      if (code === 401 || code === 403) {
        tokenRef.current = null;
        await removeItem(SESSION_KEY).catch(() => undefined);
        queryClient.clear();
        setUser(null);
        setStatus('signedOut');
      } else {
        // Transient failure: keep the saved session so the person can retry.
        setStatus('unreachable');
      }
    }
  }, [queryClient]);

  useEffect(() => {
    // Deferred so session restoration runs as an async external sync, not during commit.
    void Promise.resolve().then(checkSession);
  }, [checkSession]);

  const signIn = useCallback(
    async (session: AuthSession, hint: EntryHint) => {
      demoRef.current = null;
      setDemo(null);
      await removeItem(DEMO_KEY).catch(() => undefined);
      tokenRef.current = session.token;
      await writeItem(SESSION_KEY, session.token);
      if (userIdRef.current !== session.user.id) queryClient.clear();
      userIdRef.current = session.user.id;
      setEntryHint(hint);
      setUser(session.user);
      setStatus('signedIn');
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    if (demoRef.current) {
      await removeItem(DEMO_KEY).catch(() => undefined);
      queryClient.clear();
      tokenRef.current = null;
      demoRef.current = null;
      setDemo(null);
      setEntryHint(null);
      setUser(null);
      setStatus('signedOut');
      return;
    }
    try {
      await logoutWesal();
    } catch (error) {
      // An already-invalid session is effectively signed out; anything else must surface.
      if (errorStatus(error) !== 401) throw error;
    }
    tokenRef.current = null;
    userIdRef.current = null;
    await removeItem(SESSION_KEY).catch(() => undefined);
    queryClient.clear();
    setEntryHint(null);
    setUser(null);
    setStatus('signedOut');
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isDemo: !!demo,
      demoInvitations: demo?.invitations ?? [],
      startDemo,
      createDemoInvitation,
      revokeDemoInvitation,
      status,
      user,
      entryHint,
      pendingInvite,
      pendingReady,
      signIn,
      signOut,
      retry: () => {
        setStatus('loading');
        void checkSession();
      },
      setPendingInvite,
      clearPendingInvite,
    }),
    [demo, startDemo, createDemoInvitation, revokeDemoInvitation, status, user, entryHint, pendingInvite, pendingReady, signIn, signOut, checkSession, setPendingInvite, clearPendingInvite],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
