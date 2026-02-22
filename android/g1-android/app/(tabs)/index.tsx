import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <WebView source={{ uri: "https://g1-q8un.vercel.app" }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});