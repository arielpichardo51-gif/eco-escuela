import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const QUESTIONS = [
  { q: "¿Cuál es el principal contaminante de los océanos?", opts: ["Plástico", "Madera", "Arena", "Sal"], correct: 0 },
  { q: "¿Cuánto tarda en descomponerse una botella de plástico?", opts: ["5 años", "50 años", "500 años", "5000 años"], correct: 2 },
  { q: "¿Qué gas de efecto invernadero es el más abundante producido por humanos?", opts: ["Oxígeno", "Dióxido de carbono", "Hidrógeno", "Nitrógeno"], correct: 1 },
  { q: "¿Cuántas veces se puede reciclar el aluminio?", opts: ["Solo 1 vez", "5 veces", "10 veces", "Infinitas veces"], correct: 3 },
  { q: "¿Qué color de contenedor es para residuos orgánicos?", opts: ["Azul", "Amarillo", "Verde", "Gris"], correct: 2 },
  { q: "¿Qué porcentaje del plástico producido ha sido reciclado?", opts: ["9%", "25%", "50%", "75%"], correct: 0 },
  { q: "¿Qué es la lluvia ácida?", opts: ["Lluvia con mucha agua", "Lluvia contaminada con óxidos de azufre", "Lluvia en zonas áridas", "Lluvia tropical"], correct: 1 },
  { q: "¿Cuál es el gas que protege la Tierra de los rayos UV?", opts: ["Dióxido de carbono", "Metano", "Ozono", "Nitrógeno"], correct: 2 },
];

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPoints } = useApp();

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correct, setCorrect] = useState(0);

  const q = QUESTIONS[current];

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const isCorrect = idx === q.correct;
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    if (isCorrect) {
      setScore((s) => s + 15);
      setCorrect((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (current + 1 >= QUESTIONS.length) {
      addPoints(score, "Quiz de Contaminación");
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const optColor = (idx: number) => {
    if (!answered) return { bg: colors.card, border: colors.border, text: colors.text };
    if (idx === q.correct) return { bg: "#E8F5E9", border: "#4CAF50", text: "#2E7D32" };
    if (idx === selected) return { bg: "#FFEBEE", border: "#F44336", text: "#C62828" };
    return { bg: colors.card, border: colors.border, text: colors.mutedForeground };
  };

  if (finished) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="award" size={48} color="#FFD700" />
          <Text style={[styles.resultTitle, { color: colors.text }]}>¡Quiz terminado!</Text>
          <Text style={[styles.resultScore, { color: "#2196F3" }]}>{score} puntos</Text>
          <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>{correct}/{QUESTIONS.length} correctas</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: "#2196F3" }]} onPress={() => router.back()}>
            <Text style={styles.btnText}>Volver a Juegos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.topRow}>
        <Text style={[styles.counter, { color: colors.mutedForeground }]}>{current + 1}/{QUESTIONS.length}</Text>
        <Text style={[styles.scoreDisp, { color: "#2196F3" }]}>{score} pts</Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { width: `${(current / QUESTIONS.length) * 100}%` as any, backgroundColor: "#2196F3" }]} />
      </View>

      <View style={[styles.qCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.qText, { color: colors.text }]}>{q.q}</Text>
      </View>

      <View style={styles.opts}>
        {q.opts.map((opt, i) => {
          const c = optColor(i);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.opt, { backgroundColor: c.bg, borderColor: c.border }]}
              onPress={() => handleAnswer(i)}
              activeOpacity={0.8}
              disabled={answered}
            >
              <Text style={[styles.optText, { color: c.text }]}>{opt}</Text>
              {answered && i === q.correct && <Feather name="check-circle" size={18} color="#2E7D32" />}
              {answered && i === selected && i !== q.correct && <Feather name="x-circle" size={18} color="#C62828" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && (
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: "#2196F3" }]} onPress={handleNext}>
          <Text style={styles.nextBtnText}>{current + 1 >= QUESTIONS.length ? "Ver resultado" : "Siguiente"}</Text>
          <Feather name="chevron-right" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  counter: { fontSize: 14, fontFamily: "Inter_500Medium" },
  scoreDisp: { fontSize: 14, fontFamily: "Inter_700Bold" },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 20 },
  fill: { height: "100%", borderRadius: 3 },
  qCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 16 },
  qText: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 26, textAlign: "center" },
  opts: { gap: 10, flex: 1 },
  opt: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 12, borderWidth: 2, padding: 16 },
  optText: { fontSize: 15, fontFamily: "Inter_500Medium", flex: 1 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14, marginTop: 12 },
  nextBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  card: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 12, width: "100%", maxWidth: 360 },
  resultTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  resultScore: { fontSize: 36, fontFamily: "Inter_700Bold" },
  resultSub: { fontSize: 16, fontFamily: "Inter_500Medium" },
  btn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
