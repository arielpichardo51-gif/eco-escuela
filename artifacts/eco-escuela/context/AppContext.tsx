import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface ObraLocal {
  localId: string;
  studentName: string;
  title: string;
  description: string;
  category: string;
  hours: number;
  date: string;
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
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  studentName: "@ecoescuela:studentName",
  totalPoints: "@ecoescuela:totalPoints",
  history: "@ecoescuela:history",
  obras: "@ecoescuela:obras",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [studentName, setStudentNameState] = useState<string>("");
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [obras, setObras] = useState<ObraLocal[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [name, pts, hist, obs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.studentName),
          AsyncStorage.getItem(STORAGE_KEYS.totalPoints),
          AsyncStorage.getItem(STORAGE_KEYS.history),
          AsyncStorage.getItem(STORAGE_KEYS.obras),
        ]);
        if (name) setStudentNameState(name);
        if (pts) setTotalPoints(JSON.parse(pts));
        if (hist) setPointsHistory(JSON.parse(hist));
        if (obs) setObras(JSON.parse(obs));
      } catch {}
    }
    loadData();
  }, []);

  const setStudentName = useCallback((name: string) => {
    setStudentNameState(name);
    AsyncStorage.setItem(STORAGE_KEYS.studentName, name).catch(() => {});
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
      AsyncStorage.setItem(STORAGE_KEYS.totalPoints, JSON.stringify(next)).catch(() => {});
      return next;
    });
    setPointsHistory((prev) => {
      const next = [entry, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const resetPoints = useCallback(() => {
    setTotalPoints(0);
    setPointsHistory([]);
    AsyncStorage.setItem(STORAGE_KEYS.totalPoints, "0").catch(() => {});
    AsyncStorage.setItem(STORAGE_KEYS.history, "[]").catch(() => {});
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
        AsyncStorage.setItem(STORAGE_KEYS.obras, JSON.stringify(next)).catch(() => {});
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
      AsyncStorage.setItem(STORAGE_KEYS.obras, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const updateObraFromServer = useCallback(
    (
      localId: string,
      serverId: string,
      status: ObraLocal["status"],
      teacherComment: string | null
    ) => {
      setObras((prev) => {
        const next = prev.map((o) =>
          o.localId === localId || o.serverId === serverId
            ? { ...o, synced: true, serverId, status, teacherComment }
            : o
        );
        AsyncStorage.setItem(STORAGE_KEYS.obras, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const pendingObras = obras.filter((o) => !o.synced);

  return (
    <AppContext.Provider
      value={{
        studentName,
        setStudentName,
        totalPoints,
        addPoints,
        resetPoints,
        pointsHistory,
        obras,
        addObra,
        updateObraFromServer,
        markObraSynced,
        pendingObras,
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
