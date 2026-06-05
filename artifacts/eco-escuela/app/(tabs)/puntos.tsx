import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, getLevel } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const LEVELS = [
  { name: "Explorador", icon: "search", range: "0 – 49 pts", min: 0, max: 49 },
  { name: "Aprendiz Verde", icon: "trending-up", range: "50 – 199 pts", min: 50, max: 199 },
  { name: "Ecologista", icon: "circle", range: "200 – 499 pts", min: 200, max: 499 },
  { name: "Guardián del Planeta", icon: "shield", range: "500 – ∞ pts", min: 500, max: Infinity },
];

export default function PuntosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { totalPoints, resetPoints, pointsHistory } = useApp();
  const level = getLevel(totalPoints);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const currentLevelData = LEVELS.find((l) => l.name === level.name) ?? LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.min > totalPoints);
  const progressInLevel =
    level.next === Infinity
      ? 1
      : (totalPoints - currentLevelData.min) / (currentLevelData.max - currentLevelData.min + 1);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
        <Feather name="star" size={36} color="#FFD700" />
        <Text style={styles.ptsNum}>{totalPoints}</Text>
        <Text style={styles.ptsSub}>puntos totales</Text>
      </View>

      <View style={styles.content}>
        {/* Current level */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TU NIVEL</Text>
          <View style={styles.levelRow}>
            <View style={[styles.levelIcon, { borderColor: colors.primary + "40", backgroundColor: colors.secondary }]}>
              <Feather name={level.icon as any} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.levelName, { color: colors.text }]}>{level.name}</Text>
              <View style={[styles.levelBar, { backgroundColor: colors.muted }]}>
                <View style={[styles.levelFill, { width: `${Math.min(progressInLevel * 100, 100)}%` as any, backgroundColor: colors.primaryLight }]} />
              </View>
              {nextLevel && (
                <Text style={[styles.levelSub, { color: colors.mutedForeground }]}>
                  {level.next - totalPoints} para "{nextLevel.name}"
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Levels list */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NIVELES DISPONIBLES</Text>
          {LEVELS.map((l, i) => {
            const isCurrent = l.name === level.name;
            return (
              <View
                key={i}
                style={[
                  styles.levelItem,
                  i < LEVELS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.levelItemIcon, { backgroundColor: isCurrent ? colors.primary + "18" : "transparent" }]}>
                  <Feather name={l.icon as any} size={18} color={isCurrent ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.levelItemName, { color: isCurrent ? colors.primary : colors.text }]}>
                    {l.name}
                  </Text>
                  <Text style={[styles.levelItemRange, { color: colors.mutedForeground }]}>{l.range}</Text>
                </View>
                {isCurrent && (
                  <Feather name="check-circle" size={18} color={colors.primary} />
                )}
              </View>
            );
          })}
        </View>

        {/* History */}
        {pointsHistory.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>HISTORIAL DE ACTIVIDAD</Text>
            {pointsHistory.slice(0, 20).map((h) => {
              const d = new Date(h.date);
              const label = `${d.getDate()} ${d.toLocaleString("es", { month: "short" })}, ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
              return (
                <View key={h.id} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.historyIcon, { backgroundColor: colors.secondary }]}>
                    <Feather name="award" size={14} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyLabel, { color: colors.text }]}>{h.label}</Text>
                    <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{label}</Text>
                  </View>
                  <Text style={[styles.historyPts, { color: colors.primary }]}>+{h.points} pts</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Reset */}
        <TouchableOpacity
          style={[styles.resetBtn, { borderColor: colors.destructive }]}
          onPress={() => {
            Alert.alert(
              "Reiniciar puntos",
              "¿Estás seguro? Esta acción no se puede deshacer.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Reiniciar",
                  style: "destructive",
                  onPress: () => {
                    resetPoints();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  },
                },
              ]
            );
          }}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
          <Text style={[styles.resetText, { color: colors.destructive }]}>Reiniciar mis puntos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { alignItems: "center", paddingBottom: 28, paddingHorizontal: 20 },
  ptsNum: { fontSize: 56, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 4 },
  ptsSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)" },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  levelIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  levelName: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 6 },
  levelBar: { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  levelFill: { height: "100%", borderRadius: 3 },
  levelSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  levelItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  levelItemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  levelItemName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  levelItemRange: { fontSize: 12, fontFamily: "Inter_400Regular" },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  historyIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  historyLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  historyDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  historyPts: { fontSize: 14, fontFamily: "Inter_700Bold" },
  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1.5, paddingVertical: 14 },
  resetText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
