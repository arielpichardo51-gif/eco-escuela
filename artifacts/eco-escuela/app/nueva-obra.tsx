import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  { id: "limpieza", label: "Limpieza", icon: "trash-2" },
  { id: "reciclaje", label: "Reciclaje", icon: "refresh-cw" },
  { id: "jardin", label: "Jardín", icon: "feather" },
  { id: "siembra", label: "Siembra", icon: "sunrise" },
  { id: "campaña", label: "Campaña", icon: "users" },
  { id: "otro", label: "Otro", icon: "more-horizontal" },
];

export default function NuevaObraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addObra, studentName } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [hours, setHours] = useState("");

  const canSave = title.trim() && category && parseFloat(hours) > 0;

  const handleSave = () => {
    if (!canSave) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addObra({
      studentName: studentName,
      title: title.trim(),
      description: description.trim(),
      category,
      hours: parseFloat(hours),
      date: new Date().toISOString(),
    });
    Alert.alert(
      "Obra registrada",
      "Tu obra fue guardada localmente. Cuando tengas internet, toca el banner naranja en 'Mis Obras' para enviarla a tu profesor.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={[styles.label, { color: colors.text }]}>Nombre de la actividad *</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
          placeholder="Ej: Limpieza del patio trasero"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />

        {/* Category */}
        <Text style={[styles.label, { color: colors.text }]}>Tipo de actividad *</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => {
            const selected = category === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.catBtn,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  setCategory(c.id);
                  Haptics.selectionAsync();
                }}
              >
                <Feather name={c.icon as any} size={18} color={selected ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.catLabel, { color: selected ? "#fff" : colors.text }]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hours */}
        <Text style={[styles.label, { color: colors.text }]}>Horas dedicadas *</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
          placeholder="Ej: 2"
          placeholderTextColor={colors.mutedForeground}
          value={hours}
          onChangeText={setHours}
          keyboardType="decimal-pad"
          maxLength={4}
        />

        {/* Description */}
        <Text style={[styles.label, { color: colors.text }]}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
          placeholder="Describe brevemente lo que hiciste..."
          placeholderTextColor={colors.mutedForeground}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={300}
        />

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="wifi-off" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Tu obra se guarda en el celular aunque no tengas internet. Luego puedes enviarla al
            profesor para su aprobación.
          </Text>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: canSave ? 1 : 0.5 }]}
          disabled={!canSave}
          onPress={handleSave}
        >
          <Feather name="check" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Guardar obra</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 8 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  textArea: { height: 100, paddingTop: 12 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  catLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 4 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, paddingVertical: 16, marginTop: 8 },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
