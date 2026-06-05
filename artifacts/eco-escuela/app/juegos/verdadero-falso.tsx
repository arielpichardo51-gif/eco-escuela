import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const QUESTIONS = [
  { stmt: "El plástico tarda 500 años en descomponerse.", answer: true },
  { stmt: "El papel se puede reciclar infinitas veces.", answer: false },
  { stmt: "Los residuos orgánicos pueden convertirse en abono.", answer: true },
  { stmt: "El aluminio no es reciclable.", answer: false },
  { stmt: "La contaminación acústica afecta la salud humana.", answer: true },
  { stmt: "Solo el 9% del plástico ha sido reciclado.", answer: true },
  { stmt: "La capa de ozono nos protege de los rayos X.", answer: false },
  { stmt: "Separar la basura reduce la contaminación.", answer: true },
  { stmt: "El agua del mar puede contaminarse con plásticos.", answer: true },
  { stmt: "La lluvia ácida solo afecta a los edificios.", answer: false },
];

export default function VerdaderoFalsoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPoints } = useApp();

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[current];

  const handleAnswer = (answer: boolean) => {
    if (answered) return;
    setSelected(answer);
    setAnswered(true);
    const isCorrect = answer === q.answer;
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    if (isCorrect) {
      setScore((s) => s + 10);
      setCorrect((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (current + 1 >= QUESTIONS.length) {
      addPoints(score, "Verdadero o Falso");
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (finished) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="award" size={48} color="#FFD700" />
          <Text style={[styles.resultTitle, { color: colors.text }]}>¡Juego terminado!</Text>
          <Text style={[styles.resultScore, { color: "#9C27B0" }]}>{score} puntos</Text>
          <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>{correct}/{QUESTIONS.length} correctas</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: "#9C27B0" }]} onPress={() => router.back()}>
            <Text style={styles.btnText}>Volver a Juegos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const trueColor = answered
    ? q.answer === true
      ? { bg: "#E8F5E9", border: "#4CAF50", text: "#2E7D32" }
      : selected === true
      ? { bg: "#FFEBEE", border: "#F44336", text: "#C62828" }
      : { bg: colors.card, border: colors.border, text: colors.mutedForeground }
    : selected === true
    ? { bg: "#E3F2FD", border: "#2196F3", text: "#1565C0" }
    : { bg: colors.card, border: colors.border, text: colors.text };

  const falseColor = answered
    ? q.answer === false
      ? { bg: "#E8F5E9", border: "#4CAF50", text: "#2E7D32" }
      : selected === false
      ? { bg: "#FFEBEE", border: "#F44336", text: "#C62828" }
      : { bg: colors.card, border: colors.border, text: colors.mutedForeground }
    : selected === false
    ? { bg: "#E3F2FD", border: "#2196F3", text: "#1565C0" }
    : { bg: colors.card, border: colors.border, text: colors.text };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.topRow}>
        <Text style={[styles.counter, { color: colors.mutedForeground }]}>{current + 1}/{QUESTIONS.length}</Text>
        <Text style={[styles.scoreDisp, { color: "#9C27B0" }]}>{score} pts</Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { width: `${(current / QUESTIONS.length) * 100}%` as any, backgroundColor: "#9C27B0" }]} />
      </View>

      <View style={[styles.stmtCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.stmtBadge, { backgroundColor: "#9C27B0" + "18" }]}>
          <Feather name="check-square" size={18} color="#9C27B0" />
          <Text style={[styles.stmtBadgeLabel, { color: "#9C27B0" }]}>Verdadero o Falso</Text>
        </View>
        <Text style={[styles.stmtText, { color: colors.text }]}>{q.stmt}</Text>
      </View>

      <View style={styles.btns}>
        <TouchableOpacity
          style={[styles.answerBtn, { backgroundColor: trueColor.bg, borderColor: trueColor.border }]}
          onPress={() => handleAnswer(true)}
          disabled={answered}
          activeOpacity={0.8}
        >
          <Feather name="check-circle" size={32} color={trueColor.text} />
          <Text style={[styles.answerLabel, { color: trueColor.text }]}>Verdadero</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.answerBtn, { backgroundColor: falseColor.bg, borderColor: falseColor.border }]}
          onPress={() => handleAnswer(false)}
          disabled={answered}
          activeOpacity={0.8}
        >
          <Feather name="x-circle" size={32} color={falseColor.text} />
          <Text style={[styles.answerLabel, { color: falseColor.text }]}>Falso</Text>
        </TouchableOpacity>
      </View>

      {answered && (
        <View style={[styles.feedbackBox, { backgroundColor: selected === q.answer ? "#E8F5E9" : "#FFEBEE" }]}>
          <Text style={[styles.feedbackText, { color: selected === q.answer ? "#2E7D32" : "#C62828" }]}>
            {selected === q.answer ? "¡Correcto! +10 pts" : `Incorrecto. La respuesta es ${q.answer ? "Verdadero" : "Falso"}.`}
          </Text>
        </View>
      )}

      {answered && (
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: "#9C27B0" }]} onPress={handleNext}>
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
  stmtCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: "center", gap: 16, marginBottom: 24 },
  stmtBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  stmtBadgeLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  stmtText: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center", lineHeight: 26 },
  btns: { flexDirection: "row", gap: 16 },
  answerBtn: { flex: 1, borderWidth: 2, borderRadius: 16, padding: 20, alignItems: "center", gap: 10 },
  answerLabel: { fontSize: 16, fontFamily: "Inter_700Bold" },
  feedbackBox: { borderRadius: 12, padding: 14, marginTop: 16 },
  feedbackText: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14, marginTop: 12 },
  nextBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  card: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 12, width: "100%" },
  resultTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  resultScore: { fontSize: 36, fontFamily: "Inter_700Bold" },
  resultSub: { fontSize: 16, fontFamily: "Inter_500Medium" },
  btn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
