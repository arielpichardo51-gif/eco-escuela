import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubmitObra, useListObras } from "@workspace/api-client-react";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import type { ObraLocal } from "@/context/AppContext";

const GOAL_HOURS = 40;

function StatusBadge({ status }: { status: ObraLocal["status"] }) {
  const config = {
    local: { label: "Guardado localmente", bg: "#E0E0E0", color: "#616161", icon: "wifi-off" },
    pending: { label: "Enviada - En revisión", bg: "#FFF3E0", color: "#E65100", icon: "clock" },
    approved: { label: "Aprobada", bg: "#E8F5E9", color: "#2E7D32", icon: "check-circle" },
    rejected: { label: "Rechazada", bg: "#FFEBEE", color: "#C62828", icon: "x-circle" },
  };
  const c = config[status] || config.local;
  return (
    <View style={[statusStyles.badge, { backgroundColor: c.bg }]}>
      <Feather name={c.icon as any} size={12} color={c.color} />
      <Text style={[statusStyles.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

const statusStyles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  label: { fontSize: 11, fontFamily: "Inter_500Medium" },
});

function ObraCard({ obra }: { obra: ObraLocal }) {
  const colors = useColors();
  return (
    <View style={[obraStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={obraStyles.cardHeader}>
        <View style={[obraStyles.catIcon, { backgroundColor: colors.primary + "18" }]}>
          <Feather name="feather" size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[obraStyles.title, { color: colors.text }]}>{obra.title}</Text>
          <Text style={[obraStyles.meta, { color: colors.mutedForeground }]}>
            {obra.category} • {obra.hours}h • {new Date(obra.date).toLocaleDateString("es", { day: "numeric", month: "short" })}
          </Text>
        </View>
        <StatusBadge status={obra.status} />
      </View>
      {obra.description ? (
        <Text style={[obraStyles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {obra.description}
        </Text>
      ) : null}
      {obra.teacherComment ? (
        <View style={[obraStyles.commentBox, { backgroundColor: obra.status === "approved" ? "#E8F5E9" : "#FFEBEE" }]}>
          <Feather name="message-square" size={12} color={obra.status === "approved" ? "#2E7D32" : "#C62828"} />
          <Text style={[obraStyles.comment, { color: obra.status === "approved" ? "#2E7D32" : "#C62828" }]}>
            {obra.teacherComment}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const obraStyles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  catIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  desc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  commentBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, borderRadius: 8, padding: 8 },
  comment: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
});

export default function MisObrasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { studentName, setStudentName, obras, markObraSynced, updateObraFromServer, pendingObras } = useApp();
  const [nameInput, setNameInput] = useState(studentName);
  const [syncing, setSyncing] = useState(false);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const totalHours = obras
    .filter((o) => o.status === "approved")
    .reduce((sum, o) => sum + o.hours, 0);
  const progress = Math.min(totalHours / GOAL_HOURS, 1);

  const submitObra = useSubmitObra();

  // Fetch server obras to sync status
  const { data: serverObras, refetch: refetchServerObras } = useListObras(
    { studentName: studentName || undefined },
    { query: { enabled: !!studentName, staleTime: 30000 } }
  );

  // Sync server statuses back to local
  useEffect(() => {
    if (!serverObras) return;
    serverObras.forEach((so) => {
      updateObraFromServer(
        so.localId,
        so.id,
        so.status as ObraLocal["status"],
        so.teacherComment ?? null
      );
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
          },
        });
        markObraSynced(obra.localId, result.id);
        synced++;
      } catch {
        // offline or server error - keep as local
      }
    }
    setSyncing(false);
    if (synced > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await refetchServerObras();
      Alert.alert("Sincronización", `${synced} obra(s) enviada(s) al servidor para revisión.`);
    } else {
      Alert.alert("Sin conexión", "No se pudo conectar al servidor. Tus obras están guardadas y se enviarán cuando tengas internet.");
    }
  }, [pendingObras, submitObra, markObraSynced, refetchServerObras]);

  if (!studentName) {
    return (
      <View style={[styles.nameScreen, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <View style={[styles.nameCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="feather" size={40} color={colors.primary} />
          <Text style={[styles.nameTitle, { color: colors.text }]}>Mis Obras Ecológicas</Text>
          <Text style={[styles.nameSub, { color: colors.mutedForeground }]}>
            Ingresa tu nombre para comenzar a registrar tus obras.
          </Text>
          <TextInput
            style={[styles.nameInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            placeholder="Tu nombre completo"
            placeholderTextColor={colors.mutedForeground}
            value={nameInput}
            onChangeText={setNameInput}
            autoCapitalize="words"
          />
          <TouchableOpacity
            style={[styles.nameBtn, { backgroundColor: colors.primary, opacity: nameInput.trim() ? 1 : 0.5 }]}
            disabled={!nameInput.trim()}
            onPress={() => {
              setStudentName(nameInput.trim());
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <Text style={styles.nameBtnText}>Comenzar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            <TouchableOpacity onPress={() => setStudentName("")}>
              <Feather name="edit-2" size={13} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Progress card */}
          <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={[styles.progressTitle, { color: colors.text }]}>Progreso del año escolar</Text>
                <Text style={[styles.progressGoal, { color: colors.mutedForeground }]}>
                  Meta: {GOAL_HOURS} horas ecológicas
                </Text>
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
              {Math.round(progress * 100)}% completado — faltan {Math.max(0, GOAL_HOURS - totalHours)} horas
            </Text>
          </View>

          {/* Sync bar */}
          {pendingObras.length > 0 && (
            <TouchableOpacity
              style={[styles.syncBar, { backgroundColor: "#FFF3E0", borderColor: "#FFB74D" }]}
              onPress={syncPending}
              activeOpacity={0.8}
            >
              {syncing ? (
                <ActivityIndicator size="small" color="#E65100" />
              ) : (
                <Feather name="upload-cloud" size={16} color="#E65100" />
              )}
              <Text style={[styles.syncText, { color: "#E65100" }]}>
                {syncing
                  ? "Enviando obras..."
                  : `${pendingObras.length} obra(s) sin sincronizar — toca para enviar`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Activities */}
          <View style={styles.activitiesHeader}>
            <Text style={[styles.activitiesLabel, { color: colors.mutedForeground }]}>
              ACTIVIDADES REGISTRADAS
            </Text>
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.countText}>{obras.length}</Text>
            </View>
          </View>

          {obras.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.primary }]}>Sin actividades aún</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Registra tu primera obra ecológica tocando el botón verde.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {obras.map((o) => (
                <ObraCard key={o.localId} obra={o} />
              ))}
            </View>
          )}

          {/* Profesor button */}
          <TouchableOpacity
            style={[styles.profesorBtn, { borderColor: colors.border }]}
            onPress={() => router.push("/profesor")}
          >
            <Feather name="user-check" size={16} color={colors.mutedForeground} />
            <Text style={[styles.profesorBtnText, { color: colors.mutedForeground }]}>
              Acceso Profesores
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
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
  nameScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  nameCard: { borderRadius: 20, borderWidth: 1, padding: 28, alignItems: "center", gap: 12, width: "100%" },
  nameTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  nameSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  nameInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular", width: "100%" },
  nameBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", width: "100%", marginTop: 4 },
  nameBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  header: { alignItems: "center", paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 6 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", marginTop: 2 },
  namePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
  },
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
  activitiesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  activitiesLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  countBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  countText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  profesorBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
  },
  profesorBtnText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
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
