import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, registerForPushNotificationsAsync } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { setTeacherToken } from "@workspace/api-client-react";

const TEACHER_PIN = "1908";

type Screen = "role" | "student-name" | "teacher-pin";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setRole, setStudentName, studentName, setPushToken } = useApp();
  const [screen, setScreen] = useState<Screen>("role");
  const [nameInput, setNameInput] = useState(studentName || "");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const paddingTop = Platform.OS === "web" ? 67 : insets.top;
  const paddingBottom = Platform.OS === "web" ? 20 : insets.bottom;

  const handleAlumno = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScreen("student-name");
  };

  const handleProfesor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScreen("teacher-pin");
  };

  const handleStudentContinue = () => {
    if (!nameInput.trim()) return;
    setStudentName(nameInput.trim());
    setRole("student");
    router.replace("/(tabs)");
  };

  const handleTeacherPin = async () => {
    if (pinInput !== TEACHER_PIN) {
      setPinError(true);
      setPinInput("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setPinError(false), 2000);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRole("teacher");

    // Register for push notifications so teacher receives alerts
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setPushToken(token);
      // Register token on server in background
      try {
        await setTeacherToken({ data: { token } });
      } catch {}
    }

    router.replace("/(tabs)");
  };

  // ── ROLE SELECTION ──────────────────────────────────────────
  if (screen === "role") {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.primary, paddingTop, paddingBottom },
        ]}
      >
        <View style={styles.topSection}>
          <View style={styles.logoCircle}>
            <Feather name="feather" size={44} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Eco Escuela</Text>
          <Text style={styles.schoolName}>Instituto Guillermo Ampie Lanzas</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>¿Quién eres?</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
            Elige tu rol para continuar
          </Text>

          <TouchableOpacity
            style={[styles.roleBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={handleAlumno}
          >
            <View style={styles.roleBtnIcon}>
              <Feather name="user" size={26} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.roleBtnTitle}>Soy Alumno</Text>
              <Text style={styles.roleBtnSub}>Aprende, juega y registra obras ecológicas</Text>
            </View>
            <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, { backgroundColor: "#1B5E38" }]}
            activeOpacity={0.85}
            onPress={handleProfesor}
          >
            <View style={[styles.roleBtnIcon, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Feather name="user-check" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.roleBtnTitle}>Soy Profesor</Text>
              <Text style={styles.roleBtnSub}>Revisa y aprueba obras de tus alumnos</Text>
            </View>
            <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── STUDENT NAME ────────────────────────────────────────────
  if (screen === "student-name") {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.primary, paddingTop, paddingBottom },
        ]}
      >
        <View style={styles.topSection}>
          <View style={styles.logoCircle}>
            <Feather name="user" size={44} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Bienvenido, Alumno</Text>
          <Text style={styles.schoolName}>Ingresa tu nombre para comenzar</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Tu nombre</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.card,
              },
            ]}
            placeholder="Nombre y apellido"
            placeholderTextColor={colors.mutedForeground}
            value={nameInput}
            onChangeText={setNameInput}
            autoCapitalize="words"
            autoFocus
          />
          <TouchableOpacity
            style={[
              styles.continueBtn,
              {
                backgroundColor: colors.primary,
                opacity: nameInput.trim() ? 1 : 0.5,
              },
            ]}
            disabled={!nameInput.trim()}
            onPress={handleStudentContinue}
          >
            <Text style={styles.continueBtnText}>Entrar a la app</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen("role")}>
            <Text style={[styles.back, { color: colors.mutedForeground }]}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── TEACHER PIN ─────────────────────────────────────────────
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: "#1B5E38", paddingTop, paddingBottom },
      ]}
    >
      <View style={styles.topSection}>
        <View style={[styles.logoCircle, { backgroundColor: "#fff" }]}>
          <Feather name="user-check" size={44} color="#1B5E38" />
        </View>
        <Text style={styles.appName}>Acceso Profesor</Text>
        <Text style={styles.schoolName}>Ingresa el PIN de seguridad</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.background }]}>
        {pinError && (
          <View style={[styles.errorBanner, { backgroundColor: "#FFEBEE" }]}>
            <Feather name="x-circle" size={16} color="#C62828" />
            <Text style={[styles.errorText, { color: "#C62828" }]}>PIN incorrecto. Intenta de nuevo.</Text>
          </View>
        )}
        <Text style={[styles.cardTitle, { color: colors.text }]}>PIN de acceso</Text>
        <TextInput
          style={[
            styles.pinInput,
            {
              borderColor: pinError ? "#F44336" : colors.border,
              color: colors.text,
              backgroundColor: colors.card,
            },
          ]}
          placeholder="• • • •"
          placeholderTextColor={colors.mutedForeground}
          value={pinInput}
          onChangeText={setPinInput}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
        <TouchableOpacity
          style={[
            styles.continueBtn,
            {
              backgroundColor: "#1B5E38",
              opacity: pinInput.length >= 4 ? 1 : 0.5,
            },
          ]}
          disabled={pinInput.length < 4}
          onPress={handleTeacherPin}
        >
          <Text style={styles.continueBtnText}>Entrar como Profesor</Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setScreen("role"); setPinInput(""); }}>
          <Text style={[styles.back, { color: colors.mutedForeground }]}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 32, gap: 8 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  appName: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  schoolName: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", textAlign: "center" },
  card: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    gap: 16,
  },
  cardTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  cardSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: -8 },
  roleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 18,
  },
  roleBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  roleBtnTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  roleBtnSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  pinInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: 10,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
  },
  continueBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  back: { textAlign: "center", fontSize: 14, fontFamily: "Inter_500Medium", paddingVertical: 4 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    padding: 12,
  },
  errorText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
