import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PHOTOS = [
  require("@/assets/images/foto1.jpg"),
  require("@/assets/images/foto2.jpg"),
  require("@/assets/images/foto3.jpg"),
];

const PHOTO_CAPTIONS = [
  "Estudiantes del Instituto en actividad ambiental",
  "Brigada ecológica estudiantil",
  "Limpieza y cuidado del entorno escolar",
];

function Carousel() {
  const [active, setActive] = useState(0);
  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setActive(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
        }}
      >
        {PHOTOS.map((src, i) => (
          <View key={i} style={{ width: SCREEN_WIDTH }}>
            <Image source={src} style={styles.carouselImage} resizeMode="cover" />
            <View style={styles.captionBar}>
              <Text style={styles.captionText}>{PHOTO_CAPTIONS[i]}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dotsRow}>
        {PHOTOS.map((_, i) => (
          <View key={i} style={[styles.dot, active === i && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function CollapsibleCard({
  icon,
  iconBg,
  title,
  children,
}: {
  icon: string;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(true);
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
          <Feather name={icon as any} size={18} color="#fff" />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          {title}
        </Text>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>
      {open && <View style={styles.cardBody}>{children}</View>}
    </View>
  );
}

export default function InicioScreen() {
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
        <Feather name="feather" size={32} color="#fff" />
        <Text style={styles.headerTitle}>Eco Escuela</Text>
        <Text style={styles.headerSubtitle}>Instituto Guillermo Ampie Lanzas</Text>
      </View>

      {/* Carousel */}
      <Carousel />

      <View style={styles.content}>
        {/* Quiénes somos */}
        <CollapsibleCard icon="home" iconBg="#4CAF50" title="¿Quiénes somos?">
          <Text style={[styles.bodyText, { color: colors.text }]}>
            El <Text style={{ fontFamily: "Inter_700Bold" }}>Instituto Guillermo Ampie Lanzas</Text>{" "}
            es una institución educativa comprometida con el aprendizaje y el desarrollo integral de
            sus estudiantes. Somos una comunidad unida que busca no solo formar académicamente, sino
            también crear ciudadanos responsables con su entorno y el medio ambiente.
          </Text>
        </CollapsibleCard>

        {/* El Problema */}
        <CollapsibleCard icon="alert-triangle" iconBg="#E53935" title="El Problema">
          <Text style={[styles.bodyText, { color: colors.text }]}>
            Nuestra escuela enfrenta serios problemas de{" "}
            <Text style={{ fontFamily: "Inter_700Bold" }}>
              contaminación y mala clasificación de basura
            </Text>
            . Cada día se generan residuos que no son separados correctamente, afectando el
            impacto de la correcta clasificación de residuos y reduciendo la contaminación en
            nuestra escuela y comunidad.
          </Text>
        </CollapsibleCard>

        {/* Cómo solucionarlo */}
        <CollapsibleCard icon="sun" iconBg="#FF8F00" title="¿Cómo podemos solucionarlo?">
          {[
            "Educación ambiental continua en clases",
            "Instalación de contenedores diferenciados por tipo de residuo",
            "Campañas de sensibilización estudiantil",
            "Sistema de puntos por buenas prácticas",
            "Jornadas de limpieza escolar",
          ].map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: colors.orange }]} />
              <Text style={[styles.bulletText, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </CollapsibleCard>

        {/* Planes de Acción */}
        <CollapsibleCard icon="list" iconBg="#9C27B0" title="Planes de Acción">
          {[
            "Instalar contenedores de colores en todas las zonas del instituto",
            "Organizar talleres educativos mensuales sobre medio ambiente",
            "Implementar el sistema de puntos Eco Escuela para incentivar buenas prácticas",
            "Crear brigadas ecológicas estudiantiles para supervisar la clasificación",
            "Alianzas con empresas recicladoras locales para recoger los materiales",
          ].map((item, i) => {
            const bgColors = ["#4CAF50", "#2196F3", "#FF6B35", "#E53935", "#9C27B0"];
            return (
              <View key={i} style={styles.planRow}>
                <View style={[styles.planNum, { backgroundColor: bgColors[i] }]}>
                  <Text style={styles.planNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.planText, { color: colors.text }]}>{item}</Text>
              </View>
            );
          })}
        </CollapsibleCard>

        {/* Quote */}
        <View style={[styles.quoteBox, { backgroundColor: colors.primary }]}>
          <Feather name="refresh-cw" size={30} color="#fff" style={{ marginBottom: 10 }} />
          <Text style={styles.quoteText}>"Juntos construimos un planeta mejor"</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  carouselContainer: { position: "relative" },
  carouselImage: { width: SCREEN_WIDTH, height: 200 },
  captionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  captionText: { color: "#fff", fontSize: 12, fontFamily: "Inter_400Regular" },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: "#000",
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)" },
  dotActive: { backgroundColor: "#fff", width: 20 },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { flex: 1, fontSize: 15 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  bodyText: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bullet: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  bulletText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  planRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 8 },
  planNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  planNumText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  planText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  quoteBox: {
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginTop: 4,
  },
  quoteText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 26,
  },
});
