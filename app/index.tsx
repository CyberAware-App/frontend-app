import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Image, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

const testConnection = async () => {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		const response = await fetch("https://cyber-aware.netlify.app", {
			method: "HEAD",
			signal: controller.signal,
		});

		clearTimeout(timeoutId);
		console.log("Network test response:", response.status);
		return response.ok;
	} catch (error) {
		console.log("Network test failed:", error);
		return false;
	}
};

export default function Index() {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [canGoBack, setCanGoBack] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
	const webViewRef = useRef<WebView>(null);

	useEffect(() => {
		// Handle Android back button
		const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
			if (canGoBack) {
				webViewRef.current?.goBack();
				return true;
			}
			return false;
		});

		// Add timeout to prevent infinite loading
		const timeout = setTimeout(() => {
			if (isLoading) {
				setIsLoading(false);
				setHasError(true);
				setErrorMessage("Loading timeout. Please check your internet connection.");
			}
		}, 30000); // 30 second timeout for mobile networks

		return () => {
			backHandler.remove();
			clearTimeout(timeout);
		};
	}, [canGoBack, isLoading]);

	const handleLoadStart = () => {
		console.log("WebView: Loading started");
		// Only show loading screen for initial load, not for navigation
		if (!hasInitiallyLoaded) {
			setIsLoading(true);
		}
		setHasError(false);
		setErrorMessage("");
	};

	const handleLoadEnd = () => {
		console.log("WebView: Loading finished");
		setIsLoading(false);
		setHasInitiallyLoaded(true);
	};

	const handleError = (syntheticEvent: any) => {
		const { nativeEvent } = syntheticEvent;
		console.log("WebView: Error occurred", nativeEvent);
		setIsLoading(false);
		setHasError(true);

		// More specific error messages
		let errorMsg = "Failed to load the website.";
		if (nativeEvent.description?.includes("net::ERR_INTERNET_DISCONNECTED")) {
			errorMsg = "No internet connection. Please check your network settings.";
		} else if (nativeEvent.description?.includes("net::ERR_NETWORK_CHANGED")) {
			errorMsg = "Network connection changed. Please try again.";
		} else if (nativeEvent.description?.includes("net::ERR_TIMED_OUT")) {
			errorMsg = "Connection timed out. Please check your internet speed.";
		} else if (nativeEvent.description?.includes("net::ERR_NAME_NOT_RESOLVED")) {
			errorMsg = "Cannot resolve server address. Please check your DNS settings.";
		}

		setErrorMessage(errorMsg);
	};

	const handleNavigationStateChange = (navState: any) => {
		console.log("WebView: Navigation state changed", navState);
		setCanGoBack(navState.canGoBack);

		// Only handle loading state for initial load
		if (!navState.loading && !hasInitiallyLoaded) {
			setIsLoading(false);
			setHasInitiallyLoaded(true);
		}

		// Handle navigation within the same domain
		if (navState.url && navState.url.includes("cyber-aware.netlify.app")) {
			console.log("Internal navigation to:", navState.url);
		}
	};

	const handleHttpError = (syntheticEvent: any) => {
		console.log("WebView: HTTP Error", syntheticEvent.nativeEvent);
		setIsLoading(false);
		setHasError(true);
		setErrorMessage(`HTTP Error: ${syntheticEvent.nativeEvent.statusCode}`);
	};

	const handleReload = () => {
		setHasError(false);
		setErrorMessage("");
		setIsLoading(true);
		setHasInitiallyLoaded(false); // Reset for reload
		webViewRef.current?.reload();
	};

	if (hasError) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorTitle}>Navigation Error</Text>
				<Text style={styles.errorText}>{errorMessage}</Text>
				<Text style={[styles.errorText, styles.retryButton]} onPress={handleReload}>
					Tap to Retry
				</Text>
				<Text
					style={[styles.errorText, styles.retryButton]}
					onPress={async () => {
						const isConnected = await testConnection();
						console.log("Connection test result:", isConnected);
					}}
				>
					Test Connection
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{isLoading && (
				<View style={styles.loadingContainer}>
					<Image
						source={require("../assets/images/logo-large.png")}
						style={styles.logo}
						resizeMode="contain"
					/>
					<ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
					<Text style={styles.loadingText}>Loading CYBERAWARE...</Text>
					<Text style={styles.loadingSubtext}>Please wait while we connect to the server</Text>
				</View>
			)}
			<WebView
				ref={webViewRef}
				source={{
					uri: "https://cyber-aware.netlify.app",
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
					},
				}}
				onLoadStart={handleLoadStart}
				onLoadEnd={handleLoadEnd}
				onError={handleError}
				onHttpError={handleHttpError}
				onNavigationStateChange={handleNavigationStateChange}
				style={styles.webview}
				startInLoadingState={true}
				javaScriptEnabled={true}
				domStorageEnabled={true}
				allowsInlineMediaPlayback={true}
				mediaPlaybackRequiresUserAction={false}
				mixedContentMode="compatibility"
				originWhitelist={["*"]}
				allowsBackForwardNavigationGestures={true}
				cacheEnabled={true}
				androidLayerType="hardware"
				thirdPartyCookiesEnabled={true}
				sharedCookiesEnabled={true}
				setSupportMultipleWindows={false}
				allowsLinkPreview={false}
				bounces={false}
				scrollEnabled={true}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
				decelerationRate={0.998}
				// Network timeout settings
				onShouldStartLoadWithRequest={(request) => {
					console.log("Loading URL:", request.url);
					// Allow all navigation within the same domain
					const url = request.url;
					const isMainDomain =
						url.includes("cyber-aware.netlify.app") || url.includes("netlify.app");
					const isHttps = url.startsWith("https://");
					return isMainDomain && isHttps;
				}}
				injectedJavaScript={`
					// Handle client-side navigation for SPA/Next.js
					(function() {
						// Override pushState and replaceState to handle navigation
						const originalPushState = history.pushState;
						const originalReplaceState = history.replaceState;

						history.pushState = function() {
							originalPushState.apply(history, arguments);
							window.ReactNativeWebView?.postMessage(JSON.stringify({
								type: 'navigation',
								url: window.location.href
							}));
						};

						history.replaceState = function() {
							originalReplaceState.apply(history, arguments);
							window.ReactNativeWebView?.postMessage(JSON.stringify({
								type: 'navigation',
								url: window.location.href
							}));
						};

						// Handle popstate (back/forward buttons)
						window.addEventListener('popstate', function() {
							window.ReactNativeWebView?.postMessage(JSON.stringify({
								type: 'navigation',
								url: window.location.href
							}));
						});

						// Handle hash changes
						window.addEventListener('hashchange', function() {
							window.ReactNativeWebView?.postMessage(JSON.stringify({
								type: 'navigation',
								url: window.location.href
							}));
						});

						// Intercept link clicks to ensure they work properly
						document.addEventListener('click', function(e) {
							const target = e.target.closest('a');
							if (target && target.href) {
								const href = target.href;
								// Only handle internal links
								if (href.includes('cyber-aware.netlify.app') || href.startsWith('/')) {
									e.preventDefault();
									if (href.startsWith('/')) {
										window.location.href = window.location.origin + href;
									} else {
										window.location.href = href;
									}
								}
							}
						});

						console.log('WebView navigation handlers initialized');
					})();
					true;
				`}
				onMessage={(event) => {
					try {
						const data = JSON.parse(event.nativeEvent.data);
						if (data.type === "navigation") {
							console.log("Navigation detected:", data.url);
						}
					} catch (error) {
						console.log("Message parsing error:", error);
					}
				}}
				// Better error handling for network issues
				renderError={(errorName) => (
					<View style={styles.errorContainer}>
						<Text style={styles.errorTitle}>Connection Error</Text>
						<Text style={styles.errorText}>Error: {errorName}</Text>
						<Text style={styles.errorText}>
							Please check your internet connection and try again.
						</Text>
						<Text style={[styles.errorText, styles.retryButton]} onPress={handleReload}>
							Tap to Retry
						</Text>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	loadingContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#000",
		zIndex: 1,
	},
	loadingText: {
		marginTop: 20,
		fontSize: 18,
		color: "#fff",
		textAlign: "center",
	},
	loadingSubtext: {
		marginTop: 10,
		fontSize: 14,
		color: "#888",
		textAlign: "center",
	},
	logo: {
		width: 120,
		height: 120,
		marginBottom: 20,
	},
	spinner: {
		marginTop: 20,
		marginBottom: 10,
	},
	webview: {
		flex: 1,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#000",
		padding: 20,
	},
	errorTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#FF3B30",
		marginBottom: 20,
		textAlign: "center",
	},
	errorText: {
		fontSize: 16,
		color: "#fff",
		textAlign: "center",
		lineHeight: 24,
		marginBottom: 10,
	},
	retryButton: {
		color: "#007AFF",
		textDecorationLine: "underline",
		textAlign: "center",
	},
});
