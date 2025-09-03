/* eslint-disable import/no-named-as-default */
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { Platform, SafeAreaView, View } from "react-native";

export default function RootLayout() {
	return (
		<SafeAreaView style={{ backgroundColor: "#000", flex: 1, overflow: "hidden", width: "100%" }}>
			<View
				style={{
					backgroundColor: "#000",
					height: Platform.OS === "android" ? Constants.statusBarHeight : 0,
					width: "100%",
				}}
			/>
			<Stack
				screenOptions={{
					contentStyle: { backgroundColor: "#000", overflow: "hidden", width: "100%" },
					headerShown: false,
				}}
			/>
		</SafeAreaView>
	);
}
