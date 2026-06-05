import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const PAIRS = [
  { term: "Reciclaje", def: "Transformar residuos en nuevos materiales" },
  { term: "Compostaje", def: "Convertir residuos orgánicos en abono" },
  { term: "Biodegradable", def: "Material que se descompone de forma natural" },
  { term: "Ozono", def: "Gas que protege de los rayos ultravioleta" },
  { term: "Smog", def: "Mezcla de humo y niebla contaminante" },
  { term: "Ecología", def: "Ciencia que estudia los ecosistemas" },
];

const GAME_TIME = 60;

export default function RelacionaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPoints } = useApp();

  const [terms] = useState(() => [...PAIRS].sort(() => Math.random() - 0.5).map((p) => p.term));
  const [defs] = useState(() => [...PAIRS].sort(() => Math.random() - 0.5).map((p) => p.def));
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [selDef, setSelDef] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          addPoints(score, "Relaciona Conceptos");
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  useEffect(() => {
    if (matched.length === PAIRS.length) {
      clearInterval(timerRef.current!);
      addPoints(score, "Relaciona Conceptos");
      setFinished(true);
    }
  }, [matched]);

  useEffect(() => {
    if (!selTerm || !selDef) return;
    const pair = PAIRS.find((p) => p.term === selTerm);
    if (pair && pair.def === selDef) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore((s) => s + 20);
      setMatched((m) => [...m, selTerm]);
      setSelTerm(null);
      setSelDef(null);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrongPair(true);
      setTimeout(() => {
        setWrongPair(false);
        setSelTerm(null);
        setSelDef(null);
      }, 800);
    }
  }, [selTerm, selDef]);

  const getTermColor = (term: string) => {
    if (matched.includes(term)) return { bg: "#E8F5E9", border: "#4CAF50", text: "#2E7D32" };
    if (selTerm === term && wrongPair) return { bg: "#FFEBEE", border: "#F44336", text: "#C62828" };
    if (selTerm === term) return { bg: "#E3F2FD", border: "#2196F3", text: "#1565C0" };
    return { bg: colors.card, border: colors.border, text: colors.text };
  };

  const getDefColor = (def: string) => {
    const matchedTerm = PAIRS.find((p) => p.def === def && matched.includes(p.term));
    if (matchedTerm) return { bg: "#E8F5E9", border: "#4CAF50", text: "#2E7D32" };
    if (selDef === def && wrongPair) return { bg: "#FFEBEE", border: "#F44336", text: "#C62828" };
    if (selDef === def) return { bg: "#E3F2FD", border: "#2196F3", text: "#1565C0" };
    return { bg: colors.card, border: colors.border, text: colors.text };
  };

  if (finished) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="award" size={48} color="#FFD700" />
          <Text style={[styles.resultTitle, { color: colors.text }]}>¡Tiempo!</Text>
          <Text style={[styles.resultScore, { color: "#FF6B35" }]}>{score} puntos</Text>
          <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
            {matched.length}/{PAIRS.length} pares encontrados
          </Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: "#FF6B35" }]} onPress={() => router.back()}>
            <Text style={styles.btnText}>Volver a Juegos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.topRow}>
        <View style={styles.timerBox}>
          <Feather name="clock" size={16} color={timeLeft < 15 ? "#F44336" : "#FF6B35"} />
          <Text style={[styles.timer, { color: timeLeft < 15 ? "#F44336" : "#FF6B35" }]}>{timeLeft}s</Text>
        </View>
        <Text style={[styles.scoreDisp, { color: "#FF6B35" }]}>{score} pts</Text>
        <Text style={[styles.pairsLeft, { color: colors.mutedForeground }]}>{matched.length}/{PAIRS.length} pares</Text>
      </View>

      <Text style={[styles.instruction, { color: colors.mutedForeground }]}>Toca un término y luego su definición correcta</Text>

      <View style={styles.columns}>
        <View style={styles.col}>
          {terms.map((term) => {
            const c = getTermColor(term);
            const isMatched = matched.includes(term);
            return (
              <TouchableOpacity
                key={term}
                style={[styles.cell, { backgroundColor: c.bg, borderColor: c.border }]}
                onPress={() => !isMatched && setSelTerm(term)}
                disabled={isMatched}
              >
                <Text style={[styles.cellText, { color: c.text }]}>{term}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.col}>
          {defs.map((def) => {
            const c = getDefColor(def);
            const matchedTerm = PAIRS.find((p) => p.def === def && matched.includes(p.term));
            return (
              <TouchableOpacity
                key={def}
                style={[styles.cell, styles.defCell, { backgroundColor: c.bg, borderColor: c.border }]}
                onPress={() => !matchedTerm && setSelDef(def)}
                disabled={!!matchedTerm}
              >
                <Text style={[styles.cellText, { color: c.text, fontSize: 11 }]}>{def}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  timerBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  timer: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scoreDisp: { fontSize: 16, fontFamily: "Inter_700Bold" },
  pairsLeft: { fontSize: 14, fontFamily: "Inter_500Medium" },
  instruction: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 16 },
  columns: { flexDirection: "row", gap: 10, flex: 1 },
  col: { flex: 1, gap: 8 },
  cell: { borderWidth: 2, borderRadius: 10, padding: 12, alignItems: "center", justifyContent: "center", minHeight: 60 },
  defCell: { minHeight: 70 },
  cellText: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  card: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 12, width: "100%" },
  resultTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  resultScore: { fontSize: 36, fontFamily: "Inter_700Bold" },
  resultSub: { fontSize: 16, fontFamily: "Inter_500Medium" },
  btn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
