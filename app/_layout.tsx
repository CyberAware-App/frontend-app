import Constants from "expo-constants";
import { Stack } from "expo-router";
import { Platform, SafeAreaView, View } from "react-native";

export default function RootLayout() {
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
			<View
				style={{
					height: Platform.OS === "android" ? Constants.statusBarHeight : 0,
					backgroundColor: "#000",
				}}
			/>
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: { backgroundColor: "#000" },
				}}
			/>
		</SafeAreaView>
	);
}
