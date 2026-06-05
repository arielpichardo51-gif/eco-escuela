import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListObras, useReviewObra } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const TEACHER_PIN = "1234";

function StatusChip({ status }: { status: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: "Pendiente", bg: "#FFF3E0", color: "#E65100" },
    approved: { label: "Aprobada", bg: "#E8F5E9", color: "#2E7D32" },
    rejected: { label: "Rechazada", bg: "#FFEBEE", color: "#C62828" },
  };
  const c = cfg[status] ?? cfg.pending;
  return (
    <View style={[chip.badge, { backgroundColor: c.bg }]}>
      <Text style={[chip.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

const chip = StyleSheet.create({
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});

export default function ProfesorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const { data: obras, isLoading, refetch } = useListObras(
    { status: filter === "all" ? undefined : filter },
    { query: { enabled: authenticated, staleTime: 10000 } }
  );

  const reviewObra = useReviewObra();

  const handleAuth = () => {
    if (pin === TEACHER_PIN) {
      setAuthenticated(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("PIN incorrecto", "El PIN ingresado no es válido.");
      setPin("");
    }
  };

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      await reviewObra.mutateAsync({ id, data: { status, teacherComment: comment || null } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setReviewingId(null);
      setComment("");
      refetch();
    } catch {
      Alert.alert("Error", "No se pudo enviar la revisión. Verifica tu conexión.");
    }
  };

  if (!authenticated) {
    return (
      <View style={[styles.authScreen, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
        <View style={[styles.authCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="user-check" size={40} color={colors.primary} />
          <Text style={[styles.authTitle, { color: colors.text }]}>Acceso Profesores</Text>
          <Text style={[styles.authSub, { color: colors.mutedForeground }]}>
            Ingresa el PIN para revisar las obras de los estudiantes.
          </Text>
          <TextInput
            style={[styles.pinInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            placeholder="PIN de acceso"
            placeholderTextColor={colors.mutedForeground}
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.authBtn, { backgroundColor: colors.primary, opacity: pin.length >= 4 ? 1 : 0.5 }]}
            disabled={pin.length < 4}
            onPress={handleAuth}
          >
            <Text style={styles.authBtnText}>Entrar</Text>
          </TouchableOpacity>
          <Text style={[styles.pinHint, { color: colors.mutedForeground }]}>
            PIN por defecto: 1234
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filters */}
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["pending", "all", "approved", "rejected"] as const).map((f) => {
          const labels = { all: "Todas", pending: "Pendientes", approved: "Aprobadas", rejected: "Rechazadas" };
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && { backgroundColor: colors.primary }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterLabel, { color: filter === f ? "#fff" : colors.mutedForeground }]}>
                {labels[f]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Cargando obras...</Text>
          </View>
        )}

        {!isLoading && (!obras || obras.length === 0) && (
          <View style={styles.emptyBox}>
            <Feather name="inbox" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter === "pending" ? "No hay obras pendientes de revisión" : "Sin obras en esta categoría"}
            </Text>
          </View>
        )}

        {obras?.map((obra) => (
          <View key={obra.id} style={[styles.obraCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.obraHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.obraTitle, { color: colors.text }]}>{obra.title}</Text>
                <Text style={[styles.obraMeta, { color: colors.mutedForeground }]}>
                  {obra.studentName} • {obra.category} • {obra.hours}h
                </Text>
                <Text style={[styles.obraDate, { color: colors.mutedForeground }]}>
                  {new Date(obra.date).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
                </Text>
              </View>
              <StatusChip status={obra.status} />
            </View>

            {obra.description ? (
              <Text style={[styles.obraDesc, { color: colors.text }]}>{obra.description}</Text>
            ) : null}

            {obra.teacherComment ? (
              <View style={[styles.existingComment, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.existingCommentLabel, { color: colors.mutedForeground }]}>Tu comentario:</Text>
                <Text style={[styles.existingCommentText, { color: colors.text }]}>{obra.teacherComment}</Text>
              </View>
            ) : null}

            {obra.status === "pending" && (
              <>
                {reviewingId === obra.id ? (
                  <View style={styles.reviewBox}>
                    <TextInput
                      style={[styles.commentInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                      placeholder="Comentario (opcional)..."
                      placeholderTextColor={colors.mutedForeground}
                      value={comment}
                      onChangeText={setComment}
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                    <View style={styles.reviewBtns}>
                      <TouchableOpacity
                        style={[styles.reviewBtn, { backgroundColor: "#4CAF50" }]}
                        onPress={() => handleReview(obra.id, "approved")}
                        disabled={reviewObra.isPending}
                      >
                        <Feather name="check" size={16} color="#fff" />
                        <Text style={styles.reviewBtnText}>Aprobar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.reviewBtn, { backgroundColor: "#F44336" }]}
                        onPress={() => handleReview(obra.id, "rejected")}
                        disabled={reviewObra.isPending}
                      >
                        <Feather name="x" size={16} color="#fff" />
                        <Text style={styles.reviewBtnText}>Rechazar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.cancelBtn, { borderColor: colors.border }]}
                        onPress={() => { setReviewingId(null); setComment(""); }}
                      >
                        <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.reviewTrigger, { backgroundColor: colors.primary }]}
                    onPress={() => setReviewingId(obra.id)}
                  >
                    <Feather name="edit-3" size={14} color="#fff" />
                    <Text style={styles.reviewTriggerText}>Revisar</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  authScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  authCard: { borderRadius: 20, borderWidth: 1, padding: 28, alignItems: "center", gap: 12, width: "100%", maxWidth: 360 },
  authTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  authSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  pinInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center", width: "100%", letterSpacing: 8 },
  authBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", width: "100%" },
  authBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  pinHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  filterBar: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterBtn: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  filterLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { padding: 16, gap: 12 },
  loadingBox: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyBox: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  obraCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  obraHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  obraTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  obraMeta: { fontSize: 13, fontFamily: "Inter_400Regular" },
  obraDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  obraDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  existingComment: { borderRadius: 8, padding: 10, gap: 4 },
  existingCommentLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  existingCommentText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  reviewBox: { gap: 10 },
  commentInput: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 60 },
  reviewBtns: { flexDirection: "row", gap: 8 },
  reviewBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, paddingVertical: 10 },
  reviewBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  cancelBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" },
  cancelBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  reviewTrigger: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, paddingVertical: 10 },
  reviewTriggerText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
