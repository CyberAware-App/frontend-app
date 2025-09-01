#!/usr/bin/env node

const https = require("https");

console.log("Testing network connectivity to cyber-aware.netlify.app...\n");

// Test DNS resolution
const dns = require("dns");
dns.lookup("cyber-aware.netlify.app", (err, address, family) => {
	if (err) {
		console.log("❌ DNS Resolution failed:", err.message);
	} else {
		console.log("✅ DNS Resolution successful:", address);
	}
});

// Test HTTPS connection
const testUrl = "https://cyber-aware.netlify.app";
const req = https.get(testUrl, (res) => {
	console.log("✅ HTTPS Connection successful");
	console.log("Status Code:", res.statusCode);
	console.log("Headers:", JSON.stringify(res.headers, null, 2));

	let data = "";
	res.on("data", (chunk) => {
		data += chunk;
	});

	res.on("end", () => {
		console.log("Response length:", data.length, "bytes");
		if (data.includes("<html") || data.includes("<!DOCTYPE")) {
			console.log("✅ Valid HTML response received");
		} else {
			console.log("⚠️  Response may not be HTML");
		}
	});
});

req.on("error", (err) => {
	console.log("❌ HTTPS Connection failed:", err.message);
});

req.setTimeout(10000, () => {
	console.log("❌ Request timed out after 10 seconds");
	req.destroy();
});
