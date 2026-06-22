import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SECRET_CAT = require("@/assets/images/secret-cat.jpg");
const TAPS_NEEDED = 7;

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

// ── EASTER EGG MODAL ─────────────────────────────────────────────

function CatModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 14 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.5);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={cat.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[cat.card, { transform: [{ scale }], opacity }]}>
              <Text style={cat.title}>🐱 ¡Encontraste el secreto!</Text>
              <ExpoImage
                source={SECRET_CAT}
                style={cat.image}
                contentFit="cover"
              />
              <Text style={cat.subtitle}>Guardián secreto de Eco Escuela</Text>
              <Text style={cat.msg}>
                Este gato aprueba tu compromiso ecológico 🌿{"\n"}
                ¡Sigue cuidando el planeta!
              </Text>
              <TouchableOpacity style={cat.btn} onPress={onClose}>
                <Text style={cat.btnText}>Cerrar 😸</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const cat = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    paddingBottom: 20,
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", paddingTop: 20, paddingBottom: 12, color: "#1B5E38" },
  image: { width: "100%", height: 240 },
  subtitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#888", marginTop: 12 },
  msg: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#333", textAlign: "center", lineHeight: 22, marginTop: 8, paddingHorizontal: 20 },
  btn: { marginTop: 16, backgroundColor: "#1B5E38", borderRadius: 20, paddingHorizontal: 28, paddingVertical: 11 },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

// ── CAROUSEL ──────────────────────────────────────────────────────

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

// ── COLLAPSIBLE CARD ──────────────────────────────────────────────

function CollapsibleCard({
  icon, iconBg, title, children,
}: { icon: string; iconBg: string; title: string; children: React.ReactNode }) {
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
        <Feather name={open ? "chevron-up" : "chevron-down"} size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
      {open && <View style={styles.cardBody}>{children}</View>}
    </View>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────

export default function InicioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  // Easter egg state
  const [tapCount, setTapCount] = useState(0);
  const [showCat, setShowCat] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iconShake = useRef(new Animated.Value(0)).current;

  const handleLogoTap = () => {
    const next = tapCount + 1;
    setTapCount(next);

    // Reset timer
    if (tapTimer.current) clearTimeout(tapTimer.current);

    // Haptic feedback — gets stronger as you get closer
    if (next >= TAPS_NEEDED - 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (next >= TAPS_NEEDED - 4) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Shake the icon a little on each tap
    Animated.sequence([
      Animated.timing(iconShake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(iconShake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(iconShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();

    if (next >= TAPS_NEEDED) {
      setTapCount(0);
      setShowCat(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Reset if no tap in 2 seconds
      tapTimer.current = setTimeout(() => setTapCount(0), 2000);
    }
  };

  return (
    <>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: bottomPad + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — tap icon 7× for easter egg */}
        <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.8}>
            <Animated.View style={{ transform: [{ translateX: iconShake }] }}>
              <Feather name="feather" size={32} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Eco Escuela</Text>
          <Text style={styles.headerSubtitle}>Instituto Guillermo Ampie Lanzas</Text>
          {tapCount > 0 && tapCount < TAPS_NEEDED && (
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>
                {"🌿".repeat(tapCount)} ({tapCount}/{TAPS_NEEDED})
              </Text>
            </View>
          )}
        </View>

        <Carousel />

        <View style={styles.content}>
          <CollapsibleCard icon="home" iconBg="#4CAF50" title="¿Quiénes somos?">
            <Text style={[styles.bodyText, { color: colors.text }]}>
              El <Text style={{ fontFamily: "Inter_700Bold" }}>Instituto Guillermo Ampie Lanzas</Text>{" "}
              es una institución educativa comprometida con el aprendizaje y el desarrollo integral de
              sus estudiantes. Somos una comunidad unida que busca no solo formar académicamente, sino
              también crear ciudadanos responsables con su entorno y el medio ambiente.
            </Text>
          </CollapsibleCard>

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

          <View style={[styles.quoteBox, { backgroundColor: colors.primary }]}>
            <Feather name="refresh-cw" size={30} color="#fff" style={{ marginBottom: 10 }} />
            <Text style={styles.quoteText}>"Juntos construimos un planeta mejor"</Text>
          </View>
        </View>
      </ScrollView>

      <CatModal visible={showCat} onClose={() => setShowCat(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { alignItems: "center", paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 8 },
  headerSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", marginTop: 2 },
  tapHint: { marginTop: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  tapHintText: { color: "#fff", fontSize: 13, fontFamily: "Inter_500Medium" },
  carouselContainer: { position: "relative" },
  carouselImage: { width: SCREEN_WIDTH, height: 200 },
  captionBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.45)", paddingVertical: 6, paddingHorizontal: 12,
  },
  captionText: { color: "#fff", fontSize: 12, fontFamily: "Inter_400Regular" },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: 8, backgroundColor: "#000" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)" },
  dotActive: { backgroundColor: "#fff", width: 20 },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  cardIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cardTitle: { flex: 1, fontSize: 15 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  bodyText: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bullet: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  bulletText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  planRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 8 },
  planNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  planNumText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  planText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  quoteBox: { borderRadius: 14, padding: 24, alignItems: "center", marginTop: 4 },
  quoteText: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center", lineHeight: 26 },
});
