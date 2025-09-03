import { execSync } from "node:child_process";

console.info("🔍 Huawei Device Compatibility Checker\n");

// Check if ADB is available
try {
	execSync("adb version", { stdio: "ignore" });
	console.info("✅ ADB is available");
} catch {
	console.info("❌ ADB not found. Please install Android SDK Platform Tools");
	process.exit(1);
}

// Check connected devices
try {
	const devices = execSync("adb devices", { encoding: "utf8" });
	console.info("📱 Connected devices:");
	console.info(devices);

	if (!devices.includes("device")) {
		console.info("⚠️  No devices connected. Please connect your Huawei device via USB");
		process.exit(1);
	}
} catch (error) {
	console.info("❌ Error checking devices:", error.message);
	process.exit(1);
}

// Check device info
try {
	const brand = execSync("adb shell getprop ro.product.brand", { encoding: "utf8" }).trim();
	const model = execSync("adb shell getprop ro.product.model", { encoding: "utf8" }).trim();
	const version = execSync("adb shell getprop ro.build.version.release", { encoding: "utf8" }).trim();
	const sdk = execSync("adb shell getprop ro.build.version.sdk", { encoding: "utf8" }).trim();

	console.info(`📋 Device Info:`);
	console.info(`   Brand: ${brand}`);
	console.info(`   Model: ${model}`);
	console.info(`   Android Version: ${version}`);
	console.info(`   SDK Level: ${sdk}`);

	if (brand.toLowerCase().includes("huawei") || brand.toLowerCase().includes("honor")) {
		console.info("🎯 Huawei/Honor device detected!");

		// Check for HMS Core
		try {
			const hmsVersion = execSync("adb shell dumpsys package com.huawei.hwid | grep versionName", {
				encoding: "utf8",
			});
			console.info("✅ HMS Core detected:", hmsVersion.trim());
		} catch {
			console.info("⚠️  HMS Core not found - this may cause WebView issues");
		}

		// Check WebView implementation
		try {
			const webviewPackage = execSync("adb shell dumpsys webviewupdate", { encoding: "utf8" });
			console.info("🌐 WebView info:");
			console.info(`${webviewPackage.slice(0, 500)}...`);
		} catch {
			console.info("⚠️  Could not get WebView info");
		}
	}
} catch (error) {
	console.info("❌ Error getting device info:", error.message);
}

console.info("\n🔧 Recommended fixes for Huawei devices:");
console.info("1. Ensure HMS Core is installed and updated");
console.info('2. Enable "Allow apps from unknown sources" in settings');
console.info("3. Disable battery optimization for your app");
console.info("4. Check if WebView is updated in Huawei AppGallery");
console.info(
	"5. Try clearing WebView data: Settings > Apps > Android System WebView > Storage > Clear Data"
);
