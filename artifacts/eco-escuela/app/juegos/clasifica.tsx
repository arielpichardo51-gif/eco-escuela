import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const ITEMS = [
  { id: "1", label: "Restos de comida", correct: "verde" },
  { id: "2", label: "Botella plástica", correct: "amarillo" },
  { id: "3", label: "Periódico", correct: "azul" },
  { id: "4", label: "Ropa vieja", correct: "gris" },
  { id: "5", label: "Cáscara de banana", correct: "verde" },
  { id: "6", label: "Lata de aluminio", correct: "amarillo" },
  { id: "7", label: "Cuaderno usado", correct: "azul" },
  { id: "8", label: "Papel encerado", correct: "gris" },
  { id: "9", label: "Hojas y ramas", correct: "verde" },
  { id: "10", label: "Caja de cartón", correct: "azul" },
  { id: "11", label: "Envase de yogurt", correct: "amarillo" },
  { id: "12", label: "Icopor", correct: "gris" },
];

const BINS = [
  { id: "verde", label: "Verde\nOrgánicos", color: "#4CAF50" },
  { id: "azul", label: "Azul\nPapel/Cartón", color: "#2196F3" },
  { id: "amarillo", label: "Amarillo\nPlástico/Metal", color: "#FFC107" },
  { id: "gris", label: "Gris\nNo reciclable", color: "#9E9E9E" },
];

export default function ClasificaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPoints } = useApp();

  const [queue, setQueue] = useState(() => [...ITEMS].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ correct: boolean; item: string }[]>([]);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const item = queue[current];

  const handleSelect = (binId: string) => {
    if (feedback) return;
    setSelected(binId);
    const correct = binId === item.correct;
    setFeedback(correct ? "correct" : "wrong");
    Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    setResults((prev) => [...prev, { correct, item: item.label }]);
    if (correct) setScore((s) => s + 10);

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      if (current + 1 >= queue.length) {
        setFinished(true);
        if (correct) addPoints(score + 10, "Clasifica la Basura");
        else addPoints(score, "Clasifica la Basura");
      } else {
        setCurrent((c) => c + 1);
      }
    }, 900);
  };

  if (finished) {
    const total = results.length;
    const correct = results.filter((r) => r.correct).length;
    return (
      <View style={[styles.resultScreen, { backgroundColor: colors.background, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="award" size={48} color="#FFD700" />
          <Text style={[styles.resultTitle, { color: colors.text }]}>¡Juego terminado!</Text>
          <Text style={[styles.resultScore, { color: colors.primary }]}>{score} puntos</Text>
          <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
            {correct}/{total} correctas
          </Text>
          <View style={styles.resultList}>
            {results.map((r, i) => (
              <View key={i} style={styles.resultRow}>
                <Feather name={r.correct ? "check-circle" : "x-circle"} size={16} color={r.correct ? "#4CAF50" : "#F44336"} />
                <Text style={[styles.resultItem, { color: colors.text }]}>{r.item}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Volver a Juegos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>
      {/* Progress */}
      <View style={styles.progressRow}>
        <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
          {current + 1} / {queue.length}
        </Text>
        <Text style={[styles.scoreText, { color: colors.primary }]}>{score} pts</Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
        <View style={[styles.progressFill, { width: `${((current) / queue.length) * 100}%` as any, backgroundColor: "#4CAF50" }]} />
      </View>

      {/* Item card */}
      <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: feedback === "correct" ? "#4CAF50" : feedback === "wrong" ? "#F44336" : colors.border }]}>
        <Text style={[styles.itemQuestion, { color: colors.mutedForeground }]}>¿En cuál contenedor va...?</Text>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{item?.label}</Text>
      </View>

      {/* Bins */}
      <View style={styles.binsGrid}>
        {BINS.map((bin) => (
          <TouchableOpacity
            key={bin.id}
            style={[
              styles.binBtn,
              { borderColor: bin.color, backgroundColor: selected === bin.id ? bin.color : bin.color + "18" },
            ]}
            onPress={() => handleSelect(bin.id)}
            activeOpacity={0.75}
          >
            <Feather name="trash-2" size={24} color={selected === bin.id ? "#fff" : bin.color} />
            <Text style={[styles.binLabel, { color: selected === bin.id ? "#fff" : bin.color }]}>
              {bin.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {feedback && (
        <View style={[styles.feedbackBanner, { backgroundColor: feedback === "correct" ? "#E8F5E9" : "#FFEBEE" }]}>
          <Feather name={feedback === "correct" ? "check-circle" : "x-circle"} size={20} color={feedback === "correct" ? "#2E7D32" : "#C62828"} />
          <Text style={[styles.feedbackText, { color: feedback === "correct" ? "#2E7D32" : "#C62828" }]}>
            {feedback === "correct" ? "¡Correcto! +10 pts" : `Incorrecto. Va en ${BINS.find((b) => b.id === item?.correct)?.label.split("\n")[0]}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  scoreText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 20 },
  progressFill: { height: "100%", borderRadius: 3 },
  itemCard: { borderRadius: 16, borderWidth: 2, padding: 24, alignItems: "center", marginBottom: 20 },
  itemQuestion: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 8 },
  itemLabel: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  binsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  binBtn: { borderWidth: 2, borderRadius: 14, padding: 16, alignItems: "center", gap: 8, width: "46%" },
  binLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  feedbackBanner: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, padding: 14, marginTop: 16 },
  feedbackText: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  resultScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  resultCard: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 12, width: "100%" },
  resultTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  resultScore: { fontSize: 36, fontFamily: "Inter_700Bold" },
  resultSub: { fontSize: 16, fontFamily: "Inter_500Medium" },
  resultList: { width: "100%", gap: 6, marginTop: 4 },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  resultItem: { fontSize: 14, fontFamily: "Inter_400Regular" },
  doneBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  doneBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
