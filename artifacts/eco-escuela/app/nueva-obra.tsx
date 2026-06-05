import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const canSave = title.trim() && category && parseFloat(hours) > 0;

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería para adjuntar una foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu cámara para tomar una foto.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert("Agregar foto", "¿Cómo quieres adjuntar la foto de evidencia?", [
      { text: "Tomar foto", onPress: takePhoto },
      { text: "Elegir de galería", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleSave = () => {
    if (!canSave) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addObra({
      studentName,
      title: title.trim(),
      description: description.trim(),
      category,
      hours: parseFloat(hours),
      date: new Date().toISOString(),
      photoUri,
    });
    Alert.alert(
      "Obra registrada ✅",
      "Guardada en tu dispositivo. Cuando tengas internet, toca el banner naranja en 'Mis Obras' para enviarla al profesor.",
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
        {/* Título */}
        <Text style={[styles.label, { color: colors.text }]}>Nombre de la actividad *</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
          placeholder="Ej: Limpieza del patio trasero"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />

        {/* Categoría */}
        <Text style={[styles.label, { color: colors.text }]}>Tipo de actividad *</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => {
            const selected = category === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.catBtn,
                  { backgroundColor: selected ? colors.primary : colors.card, borderColor: selected ? colors.primary : colors.border },
                ]}
                onPress={() => { setCategory(c.id); Haptics.selectionAsync(); }}
              >
                <Feather name={c.icon as any} size={18} color={selected ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.catLabel, { color: selected ? "#fff" : colors.text }]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Horas */}
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

        {/* Descripción */}
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

        {/* Foto de evidencia */}
        <Text style={[styles.label, { color: colors.text }]}>Foto de evidencia</Text>
        {photoUri ? (
          <View style={styles.photoPreviewWrap}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
            <TouchableOpacity
              style={[styles.photoRemoveBtn, { backgroundColor: "#E53935" }]}
              onPress={() => setPhotoUri(null)}
            >
              <Feather name="x" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoChangeBtn, { backgroundColor: "rgba(0,0,0,0.55)" }]}
              onPress={showPhotoOptions}
            >
              <Feather name="camera" size={14} color="#fff" />
              <Text style={styles.photoChangeBtnText}>Cambiar foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.photoPlaceholder, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={showPhotoOptions}
          >
            <Feather name="camera" size={28} color={colors.mutedForeground} />
            <Text style={[styles.photoPlaceholderTitle, { color: colors.text }]}>Agregar foto</Text>
            <Text style={[styles.photoPlaceholderSub, { color: colors.mutedForeground }]}>
              Cámara o galería — sirve de evidencia para el profesor
            </Text>
          </TouchableOpacity>
        )}

        {/* Info offline */}
        <View style={[styles.infoBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="wifi-off" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Tu obra se guarda en el celular aunque no tengas internet. Luego la envías al
            profesor con un toque.
          </Text>
        </View>

        {/* Guardar */}
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
  photoPlaceholder: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    gap: 6,
  },
  photoPlaceholderTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  photoPlaceholderSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  photoPreviewWrap: { borderRadius: 14, overflow: "hidden", position: "relative" },
  photoPreview: { width: "100%", height: 200 },
  photoRemoveBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  photoChangeBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  photoChangeBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 4 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, paddingVertical: 16, marginTop: 8 },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
