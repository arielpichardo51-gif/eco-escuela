import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const GAMES = [
  {
    id: "clasifica",
    title: "Clasifica la Basura",
    desc: "Arrastra cada residuo al contenedor correcto. Pon a prueba tu conocimiento de reciclaje.",
    pts: "10 pts por acierto",
    color: "#4CAF50",
    icon: "refresh-cw",
    route: "/juegos/clasifica",
  },
  {
    id: "quiz",
    title: "Quiz de Contaminación",
    desc: "Responde preguntas de selección múltiple sobre medio ambiente y contaminación.",
    pts: "15 pts por respuesta",
    color: "#2196F3",
    icon: "help-circle",
    route: "/juegos/quiz",
  },
  {
    id: "relaciona",
    title: "Relaciona Conceptos",
    desc: "Empareja cada término ambiental con su definición correcta contra el reloj.",
    pts: "20 pts por par",
    color: "#FF6B35",
    icon: "copy",
    route: "/juegos/relaciona",
  },
  {
    id: "vf",
    title: "Verdadero o Falso",
    desc: "Decide si cada afirmación sobre el medio ambiente es verdadera o falsa.",
    pts: "10 pts por acierto",
    color: "#9C27B0",
    icon: "check-square",
    route: "/juegos/verdadero-falso",
  },
];

export default function JuegosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { totalPoints } = useApp();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
        <Feather name="monitor" size={28} color="#fff" />
        <Text style={styles.headerTitle}>Juegos</Text>
        <Text style={styles.headerSub}>Aprende jugando y gana puntos</Text>
        <View style={styles.ptsBadge}>
          <Feather name="star" size={14} color="#fff" />
          <Text style={styles.ptsBadgeText}>{totalPoints} pts acumulados</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ELIGE UN JUEGO</Text>

        {GAMES.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: g.color }]}
            activeOpacity={0.75}
            onPress={() => router.push(g.route as any)}
          >
            <View style={styles.cardLeft}>
              <View style={[styles.gameIcon, { backgroundColor: g.color + "18" }]}>
                <Feather name={g.icon as any} size={24} color={g.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.gameTitle, { color: colors.text }]}>{g.title}</Text>
                <Text style={[styles.gameDesc, { color: colors.mutedForeground }]}>{g.desc}</Text>
                <View style={[styles.ptsPill, { backgroundColor: g.color + "18" }]}>
                  <Feather name="star" size={11} color={g.color} />
                  <Text style={[styles.ptsText, { color: g.color }]}>{g.pts}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: g.color }]}
              onPress={() => router.push(g.route as any)}
              activeOpacity={0.8}
            >
              <Feather name="play" size={18} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Los puntos se acumulan en tu perfil. Cada juego te da puntos por respuestas correctas.
            Puedes ver tu historial en la sección{" "}
            <Text style={[styles.infoLink, { color: colors.primary }]}>Puntos</Text>.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { alignItems: "center", paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 6 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", marginTop: 2 },
  ptsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
  },
  ptsBadgeText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 12 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
  },
  cardLeft: { flex: 1, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  gameIcon: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  gameTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  gameDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 8 },
  ptsPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  ptsText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  playBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  infoBox: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 10, marginTop: 4 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  infoLink: { fontFamily: "Inter_600SemiBold" },
});
