import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubmitObra, useListObras, useReviewObra } from "@workspace/api-client-react";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import type { ObraLocal } from "@/context/AppContext";

const GOAL_HOURS = 40;

// ── SHARED COMPONENTS ──────────────────────────────────────────

function StatusBadge({ status }: { status: ObraLocal["status"] }) {
  const cfg = {
    local: { label: "Guardado localmente", bg: "#E0E0E0", color: "#616161", icon: "wifi-off" },
    pending: { label: "En revisión", bg: "#FFF3E0", color: "#E65100", icon: "clock" },
    approved: { label: "Aprobada ✓", bg: "#E8F5E9", color: "#2E7D32", icon: "check-circle" },
    rejected: { label: "Rechazada", bg: "#FFEBEE", color: "#C62828", icon: "x-circle" },
  } as const;
  const c = cfg[status] ?? cfg.local;
  return (
    <View style={[sb.badge, { backgroundColor: c.bg }]}>
      <Feather name={c.icon as any} size={11} color={c.color} />
      <Text style={[sb.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  label: { fontSize: 11, fontFamily: "Inter_500Medium" },
});

function ObraCard({ obra }: { obra: ObraLocal }) {
  const colors = useColors();
  return (
    <View style={[oc.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={oc.header}>
        <View style={[oc.catIcon, { backgroundColor: colors.primary + "18" }]}>
          <Feather name="feather" size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[oc.title, { color: colors.text }]}>{obra.title}</Text>
          <Text style={[oc.meta, { color: colors.mutedForeground }]}>
            {obra.category} • {obra.hours}h • {new Date(obra.date).toLocaleDateString("es", { day: "numeric", month: "short" })}
          </Text>
        </View>
        <StatusBadge status={obra.status} />
      </View>
      {obra.photoUri ? (
        <Image source={{ uri: obra.photoUri }} style={oc.photo} contentFit="cover" />
      ) : null}
      {obra.description ? (
        <Text style={[oc.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{obra.description}</Text>
      ) : null}
      {obra.teacherComment ? (
        <View style={[oc.comment, { backgroundColor: obra.status === "approved" ? "#E8F5E9" : "#FFEBEE" }]}>
          <Feather name="message-square" size={12} color={obra.status === "approved" ? "#2E7D32" : "#C62828"} />
          <Text style={[oc.commentText, { color: obra.status === "approved" ? "#2E7D32" : "#C62828" }]}>
            {obra.teacherComment}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
const oc = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  catIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  photo: { width: "100%", height: 140, borderRadius: 8 },
  desc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  comment: { flexDirection: "row", alignItems: "flex-start", gap: 6, borderRadius: 8, padding: 8 },
  commentText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
});

// ── TEACHER OBRA CARD ──────────────────────────────────────────

function TeacherObraCard({ obra, onReviewed }: { obra: any; onReviewed: () => void }) {
  const colors = useColors();
  const [reviewing, setReviewing] = useState(false);
  const [comment, setComment] = useState("");
  const reviewObra = useReviewObra();
  const { TextInput } = require("react-native");

  const handle = async (status: "approved" | "rejected") => {
    try {
      await reviewObra.mutateAsync({ id: obra.id, data: { status, teacherComment: comment || null } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setReviewing(false);
      setComment("");
      onReviewed();
    } catch {
      Alert.alert("Error", "No se pudo enviar. Verifica tu conexión.");
    }
  };

  const statusCfg: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: "Pendiente", bg: "#FFF3E0", color: "#E65100" },
    approved: { label: "Aprobada", bg: "#E8F5E9", color: "#2E7D32" },
    rejected: { label: "Rechazada", bg: "#FFEBEE", color: "#C62828" },
  };
  const st = statusCfg[obra.status] ?? statusCfg.pending;

  return (
    <View style={[toc.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={toc.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <View style={[toc.avatar, { backgroundColor: colors.primary }]}>
              <Text style={toc.avatarText}>{obra.studentName?.[0]?.toUpperCase() ?? "?"}</Text>
            </View>
            <Text style={[toc.student, { color: colors.text }]}>{obra.studentName}</Text>
          </View>
          <Text style={[toc.title, { color: colors.text }]}>{obra.title}</Text>
          <Text style={[toc.meta, { color: colors.mutedForeground }]}>
            {obra.category} • {obra.hours}h • {new Date(obra.date).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
          </Text>
        </View>
        <View style={[toc.badge, { backgroundColor: st.bg }]}>
          <Text style={[toc.badgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      {obra.photoUri || obra.photo ? (
        <Image source={{ uri: obra.photoUri || obra.photo }} style={toc.photo} contentFit="cover" />
      ) : null}

      {obra.description ? (
        <Text style={[toc.desc, { color: colors.text }]}>{obra.description}</Text>
      ) : null}

      {obra.teacherComment ? (
        <View style={[toc.commentBox, { backgroundColor: obra.status === "approved" ? "#E8F5E9" : "#FFEBEE" }]}>
          <Text style={[toc.commentText, { color: obra.status === "approved" ? "#2E7D32" : "#C62828" }]}>
            💬 {obra.teacherComment}
          </Text>
        </View>
      ) : null}

      {obra.status === "pending" && !reviewing && (
        <TouchableOpacity
          style={[toc.reviewBtn, { backgroundColor: colors.primary }]}
          onPress={() => setReviewing(true)}
        >
          <Feather name="edit-3" size={14} color="#fff" />
          <Text style={toc.reviewBtnText}>Revisar esta obra</Text>
        </TouchableOpacity>
      )}

      {obra.status === "pending" && reviewing && (
        <View style={{ gap: 10 }}>
          <TextInput
            style={[toc.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            placeholder="Comentario para el alumno (opcional)..."
            placeholderTextColor={colors.mutedForeground}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={[toc.approveBtn]} onPress={() => handle("approved")} disabled={reviewObra.isPending}>
              <Feather name="check" size={16} color="#fff" />
              <Text style={toc.actionText}>Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[toc.rejectBtn]} onPress={() => handle("rejected")} disabled={reviewObra.isPending}>
              <Feather name="x" size={16} color="#fff" />
              <Text style={toc.actionText}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[toc.cancelBtn, { borderColor: colors.border }]}
              onPress={() => { setReviewing(false); setComment(""); }}
            >
              <Text style={[toc.cancelText, { color: colors.mutedForeground }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const toc = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  student: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  photo: { width: "100%", height: 150, borderRadius: 8 },
  desc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  commentBox: { borderRadius: 8, padding: 10 },
  commentText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  reviewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, paddingVertical: 10 },
  reviewBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 60 },
  approveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, paddingVertical: 10, backgroundColor: "#4CAF50" },
  rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, paddingVertical: 10, backgroundColor: "#F44336" },
  cancelBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  actionText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});

// ── TEACHER VIEW ───────────────────────────────────────────────

function TeacherView() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { logout, pendingObras } = useApp();
  const [filter, setFilter] = useState<"pending" | "all" | "approved" | "rejected">("pending");
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const { data: obras, isLoading, refetch } = useListObras(
    { status: filter === "all" ? undefined : filter },
    { query: { staleTime: 10000, refetchInterval: 20000 } }
  );

  // Check for new pending and show local notification
  useEffect(() => {
    if (!obras) return;
    const pending = obras.filter((o) => o.status === "pending");
    if (pending.length > 0) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "📋 Obras pendientes",
          body: `Tienes ${pending.length} obra(s) esperando tu revisión.`,
          sound: true,
        },
        trigger: null,
      }).catch(() => {});
    }
  }, []);

  const FILTERS = [
    { key: "pending", label: "Pendientes" },
    { key: "all", label: "Todas" },
    { key: "approved", label: "Aprobadas" },
    { key: "rejected", label: "Rechazadas" },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.teacherHeader, { paddingTop: topPad + 16, backgroundColor: "#1B5E38" }]}>
        <View style={styles.teacherHeaderRow}>
          <View>
            <Text style={styles.teacherTitle}>Panel del Profesor</Text>
            <Text style={styles.teacherSub}>Revisión de obras ecológicas</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => {
            Alert.alert("Cerrar sesión", "¿Salir del modo profesor?", [
              { text: "Cancelar", style: "cancel" },
              { text: "Salir", onPress: logout },
            ]);
          }}>
            <Feather name="log-out" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterPill, filter === f.key && { backgroundColor: "#fff" }]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, { color: filter === f.key ? "#1B5E38" : "rgba(255,255,255,0.8)" }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1B5E38" />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Cargando obras...</Text>
          </View>
        )}
        {!isLoading && (!obras || obras.length === 0) && (
          <View style={styles.center}>
            <Feather name="inbox" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter === "pending" ? "No hay obras pendientes 🎉" : "Sin obras en esta categoría"}
            </Text>
          </View>
        )}
        <View style={{ gap: 12 }}>
          {obras?.map((obra) => (
            <TeacherObraCard key={obra.id} obra={obra} onReviewed={() => refetch()} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── STUDENT VIEW ───────────────────────────────────────────────

export default function MisObrasScreen() {
  const { role } = useApp();
  if (role === "teacher") return <TeacherView />;
  return <StudentView />;
}

function StudentView() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { studentName, obras, markObraSynced, updateObraFromServer, pendingObras, logout } = useApp();
  const [syncing, setSyncing] = useState(false);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const totalHours = obras.filter((o) => o.status === "approved").reduce((s, o) => s + o.hours, 0);
  const progress = Math.min(totalHours / GOAL_HOURS, 1);

  const submitObra = useSubmitObra();
  const { data: serverObras, refetch } = useListObras(
    { studentName: studentName || undefined },
    { query: { enabled: !!studentName, staleTime: 30000 } }
  );

  useEffect(() => {
    if (!serverObras) return;
    serverObras.forEach((so) => {
      updateObraFromServer(so.localId, so.id, so.status as ObraLocal["status"], so.teacherComment ?? null);
    });
  }, [serverObras, updateObraFromServer]);

  const syncPending = useCallback(async () => {
    if (pendingObras.length === 0) return;
    setSyncing(true);
    let synced = 0;
    for (const obra of pendingObras) {
      try {
        const result = await submitObra.mutateAsync({
          data: {
            localId: obra.localId,
            studentName: obra.studentName,
            title: obra.title,
            description: obra.description,
            category: obra.category,
            hours: obra.hours,
            date: obra.date,
            photo: obra.photoUri ?? undefined,
          } as any,
        });
        markObraSynced(obra.localId, result.id);
        synced++;
      } catch {}
    }
    setSyncing(false);
    if (synced > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await refetch();
      Alert.alert("¡Listo!", `${synced} obra(s) enviadas al profesor para revisión.`);
    } else {
      Alert.alert("Sin conexión", "Tus obras están guardadas y se enviarán cuando tengas internet.");
    }
  }, [pendingObras, submitObra, markObraSynced, refetch]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
          <Feather name="feather" size={28} color="#fff" />
          <Text style={styles.headerTitle}>Mis Obras Ecológicas</Text>
          <Text style={styles.headerSub}>Instituto Guillermo Ampie Lanzas</Text>
          <View style={styles.namePill}>
            <Feather name="user" size={13} color={colors.primary} />
            <Text style={[styles.namePillText, { color: colors.primary }]}>{studentName}</Text>
            <TouchableOpacity onPress={() => {
              Alert.alert("Cerrar sesión", "¿Salir de tu cuenta?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir", onPress: logout },
              ]);
            }}>
              <Feather name="log-out" size={13} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Progress */}
          <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={[styles.progressTitle, { color: colors.text }]}>Progreso del año</Text>
                <Text style={[styles.progressGoal, { color: colors.mutedForeground }]}>Meta: {GOAL_HOURS} horas</Text>
              </View>
              <View style={[styles.hoursBox, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.hoursNum, { color: colors.text }]}>{totalHours}</Text>
                <Text style={[styles.hoursLabel, { color: colors.mutedForeground }]}>/ {GOAL_HOURS} hrs</Text>
              </View>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: colors.primaryLight }]} />
            </View>
            <Text style={[styles.progressPct, { color: colors.mutedForeground }]}>
              {Math.round(progress * 100)}% — faltan {Math.max(0, GOAL_HOURS - totalHours)} horas
            </Text>
          </View>

          {/* Sync banner */}
          {pendingObras.length > 0 && (
            <TouchableOpacity
              style={[styles.syncBar, { backgroundColor: "#FFF3E0", borderColor: "#FFB74D" }]}
              onPress={syncPending}
              activeOpacity={0.8}
            >
              {syncing ? <ActivityIndicator size="small" color="#E65100" /> : <Feather name="upload-cloud" size={16} color="#E65100" />}
              <Text style={[styles.syncText, { color: "#E65100" }]}>
                {syncing ? "Enviando obras..." : `${pendingObras.length} sin sincronizar — toca para enviar`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Lista */}
          <View style={styles.listHeader}>
            <Text style={[styles.listLabel, { color: colors.mutedForeground }]}>ACTIVIDADES REGISTRADAS</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.countText}>{obras.length}</Text>
            </View>
          </View>

          {obras.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.primary }]}>Sin actividades aún</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Toca el botón verde para registrar tu primera obra.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {obras.map((o) => <ObraCard key={o.localId} obra={o} />)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomPad + 90 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/nueva-obra");
        }}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  teacherHeader: { paddingBottom: 12, paddingHorizontal: 20 },
  teacherHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  teacherTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  teacherSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  logoutBtn: { padding: 8 },
  filterRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  filterPill: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  center: { alignItems: "center", paddingVertical: 50, gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  header: { alignItems: "center", paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 6 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", marginTop: 2 },
  namePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 10 },
  namePillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  content: { padding: 16, gap: 12 },
  progressCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  progressTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  progressGoal: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  hoursBox: { borderRadius: 10, padding: 10, alignItems: "center" },
  hoursNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  hoursLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressPct: { fontSize: 12, fontFamily: "Inter_400Regular" },
  syncBar: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12 },
  syncText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  listLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  countBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  countText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
