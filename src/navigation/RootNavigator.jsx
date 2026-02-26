import React from "react";
import { StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MiniPlayer } from "../components/MiniPlayer";
import { HomeScreen } from "../screens/HomeScreen";
import { PlayerScreen } from "../screens/PlayerScreen";
import { QueueScreen } from "../screens/QueueScreen";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <View style={styles.container}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTitleAlign: "center",
          contentStyle: { backgroundColor: "#F9FAFB" }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Dashboard" }} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ title: "Player" }}
        />
        <Stack.Screen name="Queue" component={QueueScreen} options={{ title: "Queue" }} />
      </Stack.Navigator>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
