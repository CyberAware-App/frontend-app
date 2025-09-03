// Test DNS resolution
import dns from "node:dns";
import https from "node:https";

console.info("Testing network connectivity to cyber-aware.netlify.app...\n");

dns.lookup("cyber-aware.netlify.app", (err, address, family) => {
	if (err) {
		console.info("❌ DNS Resolution failed:", err.message);
	} else {
		console.info("✅ DNS Resolution successful:", address);
	}
});

// Test HTTPS connection
const testUrl = "https://cyber-aware.netlify.app";
const req = https.get(testUrl, (res) => {
	console.info("✅ HTTPS Connection successful");
	console.info("Status Code:", res.statusCode);
	console.info("Headers:", JSON.stringify(res.headers, null, 2));

	let data = "";
	res.on("data", (chunk) => {
		data += chunk;
	});

	res.on("end", () => {
		console.info("Response length:", data.length, "bytes");
		if (data.includes("<html") || data.includes("<!DOCTYPE")) {
			console.info("✅ Valid HTML response received");
		} else {
			console.info("⚠️  Response may not be HTML");
		}
	});
});

req.on("error", (err) => {
	console.info("❌ HTTPS Connection failed:", err.message);
});

req.setTimeout(10000, () => {
	console.info("❌ Request timed out after 10 seconds");
	req.destroy();
});
