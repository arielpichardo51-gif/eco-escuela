import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

function CollapsibleSection({
  icon,
  iconBg,
  title,
  children,
  defaultOpen = true,
}: {
  icon: string;
  iconBg: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={[styles.icon, { backgroundColor: iconBg }]}>
          <Feather name={icon as any} size={16} color="#fff" />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

const TIPOS_CONTAMINACION = [
  { icon: "droplet", color: "#2196F3", label: "Del agua", desc: "Desechos y químicos que contaminan ríos, lagos y mares." },
  { icon: "wind", color: "#78909C", label: "Del aire", desc: "Gases tóxicos y partículas que respiramos cada día." },
  { icon: "layers", color: "#795548", label: "Del suelo", desc: "Basura y sustancias que dañan la tierra y la flora." },
  { icon: "volume-2", color: "#FF6B35", label: "Acústica", desc: "Ruido excesivo que afecta la salud y bienestar." },
  { icon: "eye", color: "#9C27B0", label: "Visual", desc: "Basura y residuos que afean y deterioran el ambiente." },
];

const CAUSAS = [
  "Arrojar basura fuera de los contenedores",
  "No separar los residuos correctamente",
  "Uso excesivo de plásticos de un solo uso",
  "Falta de contenedores suficientes y bien ubicados",
  "Desconocimiento sobre qué va en cada recipiente",
  "Actitudes de indiferencia hacia el medio ambiente",
];

const BINS = [
  { color: "#4CAF50", bg: "#E8F5E9", label: "Verde — Orgánicos", items: ["Restos de comida", "Cáscaras de frutas", "Hojas y ramas", "Servilletas sucias"] },
  { color: "#2196F3", bg: "#E3F2FD", label: "Azul — Papel y Cartón", items: ["Periódicos y revistas", "Cajas de cartón", "Cuadernos usados", "Bolsas de papel"] },
  { color: "#FF8F00", bg: "#FFF8E1", label: "Amarillo — Plástico y Metal", items: ["Botellas plásticas", "Latas de aluminio", "Envases de yogurt", "Tapas plásticas"] },
  { color: "#616161", bg: "#F5F5F5", label: "Gris — No reciclable", items: ["Papel encerado", "Papas fritas vacías", "Icopor / Poliestireno", "Ropa vieja"] },
];

const DATOS = [
  { bg: "#4CAF50", text: "Cada año se producen más de 400 millones de toneladas de plástico en el mundo." },
  { bg: "#2196F3", text: "Solo el 9% del plástico producido desde 1950 ha sido reciclado." },
  { bg: "#FF6B35", text: "Una botella de plástico tarda hasta 500 años en descomponerse." },
  { bg: "#E53935", text: "El papel puede reciclarse hasta 7 veces antes de perder su calidad." },
  { bg: "#9C27B0", text: "Reciclar una lata de aluminio ahorra energía suficiente para ver TV durante 3 horas." },
  { bg: "#795548", text: "Los residuos orgánicos bien separados pueden convertirse en abono natural." },
];

export default function AprendeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
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
        <Feather name="book-open" size={28} color="#fff" />
        <Text style={styles.headerTitle}>Aprende</Text>
        <Text style={styles.headerSub}>Información sobre contaminación y reciclaje</Text>
      </View>

      <View style={styles.content}>
        {/* Qué es la contaminación */}
        <CollapsibleSection icon="globe" iconBg="#2196F3" title="¿Qué es la contaminación?">
          <Text style={[styles.body, { color: colors.text }]}>
            La <Text style={styles.bold}>contaminación ambiental</Text> es la introducción de
            sustancias, energías o agentes físicos, químicos o biológicos en el medio ambiente que
            causan daños a los seres vivos y al ecosistema.{"\n\n"}En nuestra escuela, la
            contaminación proviene principalmente de la{" "}
            <Text style={styles.bold}>mala gestión de residuos sólidos</Text>: basura tirada en el
            suelo, recipientes sin clasificar y el uso excesivo de plásticos desechables.
          </Text>
        </CollapsibleSection>

        {/* Tipos de contaminación */}
        <CollapsibleSection icon="list" iconBg="#4CAF50" title="Tipos de contaminación">
          {TIPOS_CONTAMINACION.map((t, i) => (
            <View key={i} style={styles.tipoRow}>
              <View style={[styles.tipoIcon, { backgroundColor: t.color + "22" }]}>
                <Feather name={t.icon as any} size={18} color={t.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipoLabel, { color: colors.text }]}>{t.label}</Text>
                <Text style={[styles.tipoDesc, { color: colors.mutedForeground }]}>{t.desc}</Text>
              </View>
            </View>
          ))}
        </CollapsibleSection>

        {/* Causas principales */}
        <CollapsibleSection icon="alert-circle" iconBg="#FF6B35" title="Causas principales">
          <Text style={[styles.body, { color: colors.text, marginBottom: 8 }]}>
            Las principales causas de contaminación en nuestra escuela y comunidad son:
          </Text>
          {CAUSAS.map((c, i) => (
            <View key={i} style={styles.causaRow}>
              <Feather name="x-circle" size={16} color={colors.destructive} />
              <Text style={[styles.causaText, { color: colors.text }]}>{c}</Text>
            </View>
          ))}
        </CollapsibleSection>

        {/* Clasificación de la basura */}
        <CollapsibleSection icon="refresh-cw" iconBg="#9C27B0" title="Clasificación de la basura">
          <Text style={[styles.body, { color: colors.text, marginBottom: 12 }]}>
            Para reciclar correctamente, separamos los residuos en{" "}
            <Text style={styles.bold}>4 contenedores</Text> según su tipo:
          </Text>
          {BINS.map((bin, i) => (
            <View key={i} style={[styles.binCard, { backgroundColor: bin.bg, borderLeftColor: bin.color }]}>
              <Text style={[styles.binLabel, { color: bin.color }]}>{bin.label}</Text>
              {bin.items.map((item, j) => (
                <Text key={j} style={[styles.binItem, { color: "#444" }]}>• {item}</Text>
              ))}
            </View>
          ))}
        </CollapsibleSection>

        {/* Datos importantes */}
        <CollapsibleSection icon="info" iconBg="#FF8F00" title="Datos importantes">
          <Text style={[styles.body, { color: colors.text, marginBottom: 12 }]}>
            ¿Sabías que...?
          </Text>
          {DATOS.map((d, i) => (
            <View key={i} style={[styles.datoCard, { backgroundColor: d.bg }]}>
              <Text style={styles.datoNum}>{i + 1}</Text>
              <Text style={styles.datoText}>{d.text}</Text>
            </View>
          ))}
        </CollapsibleSection>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { alignItems: "center", paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 6 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", marginTop: 2, textAlign: "center" },
  content: { padding: 16, gap: 12 },
  section: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  sectionHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  icon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sectionTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  body: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  bold: { fontFamily: "Inter_700Bold" },
  tipoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  tipoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tipoLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  tipoDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  causaRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 6 },
  causaText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  binCard: { borderLeftWidth: 4, borderRadius: 8, padding: 12, marginBottom: 8 },
  binLabel: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 6 },
  binItem: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  datoCard: { flexDirection: "row", borderRadius: 10, padding: 12, marginBottom: 8, alignItems: "flex-start", gap: 12 },
  datoNum: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", minWidth: 20 },
  datoText: { color: "#fff", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 19 },
});
