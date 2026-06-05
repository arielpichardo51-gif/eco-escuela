import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

export type Role = "student" | "teacher" | null;

export interface ObraLocal {
  localId: string;
  studentName: string;
  title: string;
  description: string;
  category: string;
  hours: number;
  date: string;
  photoUri: string | null;
  synced: boolean;
  serverId: string | null;
  status: "local" | "pending" | "approved" | "rejected";
  teacherComment: string | null;
}

export interface PointsHistory {
  id: string;
  label: string;
  points: number;
  date: string;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  logout: () => void;
  studentName: string;
  setStudentName: (name: string) => void;
  totalPoints: number;
  addPoints: (pts: number, label: string) => void;
  resetPoints: () => void;
  pointsHistory: PointsHistory[];
  obras: ObraLocal[];
  addObra: (
    obra: Omit<ObraLocal, "localId" | "synced" | "serverId" | "status" | "teacherComment">
  ) => void;
  updateObraFromServer: (
    localId: string,
    serverId: string,
    status: ObraLocal["status"],
    teacherComment: string | null
  ) => void;
  markObraSynced: (localId: string, serverId: string) => void;
  pendingObras: ObraLocal[];
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const KEYS = {
  role: "@ecoescuela:role",
  studentName: "@ecoescuela:studentName",
  totalPoints: "@ecoescuela:totalPoints",
  history: "@ecoescuela:history",
  obras: "@ecoescuela:obras",
  pushToken: "@ecoescuela:pushToken",
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
    shouldShowAlert: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;
  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);
  const [studentName, setStudentNameState] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [obras, setObras] = useState<ObraLocal[]>([]);
  const [pushToken, setPushTokenState] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [r, name, pts, hist, obs, tok] = await Promise.all([
          AsyncStorage.getItem(KEYS.role),
          AsyncStorage.getItem(KEYS.studentName),
          AsyncStorage.getItem(KEYS.totalPoints),
          AsyncStorage.getItem(KEYS.history),
          AsyncStorage.getItem(KEYS.obras),
          AsyncStorage.getItem(KEYS.pushToken),
        ]);
        if (r) setRoleState(r as Role);
        if (name) setStudentNameState(name);
        if (pts) setTotalPoints(JSON.parse(pts));
        if (hist) setPointsHistory(JSON.parse(hist));
        if (obs) setObras(JSON.parse(obs));
        if (tok) setPushTokenState(tok);
      } catch {}
    }
    load();
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    if (r) AsyncStorage.setItem(KEYS.role, r).catch(() => {});
    else AsyncStorage.removeItem(KEYS.role).catch(() => {});
  }, []);

  const logout = useCallback(() => {
    setRoleState(null);
    AsyncStorage.removeItem(KEYS.role).catch(() => {});
  }, []);

  const setStudentName = useCallback((name: string) => {
    setStudentNameState(name);
    AsyncStorage.setItem(KEYS.studentName, name).catch(() => {});
  }, []);

  const setPushToken = useCallback((token: string | null) => {
    setPushTokenState(token);
    if (token) AsyncStorage.setItem(KEYS.pushToken, token).catch(() => {});
    else AsyncStorage.removeItem(KEYS.pushToken).catch(() => {});
  }, []);

  const addPoints = useCallback((pts: number, label: string) => {
    const entry: PointsHistory = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      label,
      points: pts,
      date: new Date().toISOString(),
    };
    setTotalPoints((prev) => {
      const next = prev + pts;
      AsyncStorage.setItem(KEYS.totalPoints, JSON.stringify(next)).catch(() => {});
      return next;
    });
    setPointsHistory((prev) => {
      const next = [entry, ...prev];
      AsyncStorage.setItem(KEYS.history, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const resetPoints = useCallback(() => {
    setTotalPoints(0);
    setPointsHistory([]);
    AsyncStorage.setItem(KEYS.totalPoints, "0").catch(() => {});
    AsyncStorage.setItem(KEYS.history, "[]").catch(() => {});
  }, []);

  const addObra = useCallback(
    (obra: Omit<ObraLocal, "localId" | "synced" | "serverId" | "status" | "teacherComment">) => {
      const newObra: ObraLocal = {
        ...obra,
        localId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        synced: false,
        serverId: null,
        status: "local",
        teacherComment: null,
      };
      setObras((prev) => {
        const next = [newObra, ...prev];
        AsyncStorage.setItem(KEYS.obras, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const markObraSynced = useCallback((localId: string, serverId: string) => {
    setObras((prev) => {
      const next = prev.map((o) =>
        o.localId === localId
          ? { ...o, synced: true, serverId, status: "pending" as const }
          : o
      );
      AsyncStorage.setItem(KEYS.obras, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const updateObraFromServer = useCallback(
    (localId: string, serverId: string, status: ObraLocal["status"], teacherComment: string | null) => {
      setObras((prev) => {
        const next = prev.map((o) =>
          o.localId === localId || o.serverId === serverId
            ? { ...o, synced: true, serverId, status, teacherComment }
            : o
        );
        AsyncStorage.setItem(KEYS.obras, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        role, setRole, logout,
        studentName, setStudentName,
        totalPoints, addPoints, resetPoints, pointsHistory,
        obras, addObra, updateObraFromServer, markObraSynced,
        pendingObras: obras.filter((o) => !o.synced),
        pushToken, setPushToken,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function getLevel(pts: number) {
  if (pts < 50) return { name: "Explorador", icon: "search", next: 50 };
  if (pts < 200) return { name: "Aprendiz Verde", icon: "trending-up", next: 200 };
  if (pts < 500) return { name: "Ecologista", icon: "circle", next: 500 };
  return { name: "Guardián del Planeta", icon: "shield", next: Infinity };
}
