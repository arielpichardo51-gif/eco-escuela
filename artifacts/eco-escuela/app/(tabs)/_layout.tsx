import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useListObras } from "@workspace/api-client-react";

function PendingBadge() {
  const { role } = useApp();
  const { data: obras } = useListObras(
    { status: "pending" },
    { query: { enabled: role === "teacher", staleTime: 15000, refetchInterval: 30000 } }
  );
  const count = obras?.length ?? 0;
  if (role !== "teacher" || count === 0) return null;
  return (
    <View style={badge.wrap}>
      <Text style={badge.text}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  text: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
});

export default function TabLayout() {
  const colors = useColors();
  const { role } = useApp();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const isTeacher = role === "teacher";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isTeacher ? "#1B5E38" : colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_500Medium",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="aprende"
        options={{
          title: "Aprende",
          tabBarIcon: ({ color }) => <Feather name="book-open" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="juegos"
        options={{
          title: "Juegos",
          tabBarIcon: ({ color }) => <Feather name="monitor" size={22} color={color} />,
          // Hide for teachers using href null equivalent
          tabBarItemStyle: isTeacher ? { display: "none" } : undefined,
          href: isTeacher ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="mis-obras"
        options={{
          title: isTeacher ? "Obras" : "Mis Obras",
          tabBarIcon: ({ color }) => (
            <View>
              <Feather name={isTeacher ? "clipboard" : "edit-2"} size={22} color={color} />
              <PendingBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="puntos"
        options={{
          title: "Puntos",
          tabBarIcon: ({ color }) => <Feather name="star" size={22} color={color} />,
          tabBarItemStyle: isTeacher ? { display: "none" } : undefined,
          href: isTeacher ? null : undefined,
        }}
      />
    </Tabs>
  );
}
