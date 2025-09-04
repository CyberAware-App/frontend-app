/* eslint-disable ts-eslint/no-unsafe-member-access */
/* eslint-disable ts-eslint/no-unsafe-call */
/* eslint-disable ts-eslint/no-unsafe-assignment */
import { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	BackHandler,
	Image,
	Linking,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { WebView } from "react-native-webview";
// @ts-expect-error - Ignore this
import logo from "../assets/images/logo-large.png";

const SITE_LINK = "https://cyber-aware.netlify.app";

const openInBrowser = () => {
	Linking.openURL(SITE_LINK).catch(() => {
		Alert.alert("Error", "Failed to open browser.");
	});
};

export default function Index() {
	// State
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [canGoBack, setCanGoBack] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
	const webViewRef = useRef<WebView>(null);

	const handleLoadStart = () => {
		if (!hasInitiallyLoaded) {
			setIsLoading(true);
		}
		setHasError(false);
		setErrorMessage("");
	};

	const handleLoadEnd = () => {
		setIsLoading(false);
		setHasInitiallyLoaded(true);
	};

	// eslint-disable-next-line ts-eslint/no-explicit-any
	const handleError = (syntheticEvent: any) => {
		const { nativeEvent } = syntheticEvent;
		setIsLoading(false);
		setHasError(true);

		let errorMsg = "Failed to load the website.";
		if (nativeEvent.description?.includes("net::ERR_INTERNET_DISCONNECTED")) {
			errorMsg = "No internet connection. Please check your network settings.";
		} else if (nativeEvent.description?.includes("net::ERR_TIMED_OUT")) {
			errorMsg = "Connection timed out. Please check your internet speed.";
		}

		setErrorMessage(errorMsg);
	};

	// eslint-disable-next-line ts-eslint/no-explicit-any
	const handleNavigationStateChange = (navState: any) => {
		console.info("WebView: Navigation state changed", navState);
		// eslint-disable-next-line ts-eslint/no-unsafe-argument
		setCanGoBack(navState.canGoBack);
		if (!navState.loading && !hasInitiallyLoaded) {
			setIsLoading(false);
			setHasInitiallyLoaded(true);
		}
	};

	const handleReload = () => {
		setHasError(false);
		setErrorMessage("");
		setIsLoading(true);
		setHasInitiallyLoaded(false);
		webViewRef.current?.reload();
	};

	useEffect(() => {
		// eslint-disable-next-line react-web-api/no-leaked-event-listener
		const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
			if (canGoBack) {
				webViewRef.current?.goBack();
				return true;
			}
			return false;
		});

		const timeout = setTimeout(() => {
			if (isLoading) {
				setIsLoading(false);
				setHasError(true);
				setErrorMessage("Loading timeout. Please check your internet connection.");
			}
		}, 30000);

		return () => {
			backHandler.remove();
			clearTimeout(timeout);
		};
	}, [canGoBack, isLoading]);

	if (hasError) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorTitle}>Connection Error</Text>
				<Text style={styles.errorText}>{errorMessage}</Text>
				<Text style={[styles.errorText, styles.retryButton]} onPress={handleReload}>
					Tap to Retry
				</Text>
				<Text style={[styles.errorText, styles.retryButton]} onPress={openInBrowser}>
					Open in Browser
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{isLoading && (
				<View style={styles.loadingContainer}>
					<Image source={logo} style={styles.logo} resizeMode="contain" />
					<ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
					<Text style={styles.loadingText}>Loading CYBERAWARE...</Text>
					<Text style={styles.loadingSubtext}>Please wait while we connect to the server</Text>
				</View>
			)}
			<WebView
				ref={webViewRef}
				source={{
					headers: {
						Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
						"User-Agent":
							"Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
					},
					uri: SITE_LINK,
				}}
				onLoadStart={handleLoadStart}
				onLoadEnd={handleLoadEnd}
				onError={handleError}
				onNavigationStateChange={handleNavigationStateChange}
				style={styles.webview}
				javaScriptEnabled={true}
				domStorageEnabled={true}
				allowsBackForwardNavigationGestures={true}
				cacheEnabled={true}
				cacheMode="LOAD_DEFAULT"
				incognito={false}
				thirdPartyCookiesEnabled={true}
				sharedCookiesEnabled={true}
				mixedContentMode="compatibility"
				originWhitelist={["*"]}
				allowFileAccess={true}
				scalesPageToFit={true}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
				onShouldStartLoadWithRequest={(request) => {
					const url = request.url;
					const isMainDomain = url.startsWith(SITE_LINK);
					return isMainDomain;
				}}
				injectedJavaScript={`
						// Setup viewport and prevent horizontal scrolling
						const setupViewport = () => {
							let viewport = document.querySelector('meta[name="viewport"]');
							if (!viewport) {
								viewport = document.createElement('meta');
								viewport.name = 'viewport';
								document.head.appendChild(viewport);
							}
							viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

							const style = document.createElement('style');
							style.textContent = 'html,body{overflow-x:hidden!important;width:100%!important}';
							document.head.appendChild(style);
						};

						// Intercept certificate downloads
						const interceptDownloads = () => {
							// Override document.createElement to intercept download links
							const originalCreateElement = document.createElement;
							document.createElement = function(tagName) {
								const element = originalCreateElement.call(this, tagName);
								if (tagName.toLowerCase() === 'a') {
									const originalClick = element.click;
									element.click = function(e) {
										// Check if this is a download link with .pdf extension
										if (this.download && (this.download.includes('.pdf') || this.href.startsWith('blob:'))) {
											// Prevent the download
											if (e) {
												e.preventDefault();
												e.stopPropagation();
											}

											window.ReactNativeWebView?.postMessage(JSON.stringify({
												type: 'certificateDownload'
											}));
											return false;
										}
										return originalClick.call(this, e);
									};
								}
								return element;
							};

							// Also add a global listener for any download attempts
							document.addEventListener('click', (e) => {
								const target = e.target.closest('a');
								if (target && target.download && (target.download.includes('.pdf') || target.href.startsWith('blob:'))) {
									e.preventDefault();
									e.stopPropagation();
									window.ReactNativeWebView?.postMessage(JSON.stringify({
										type: 'certificateDownload'
									}));
								}
							}, true);
						};

						setupViewport();
						interceptDownloads();
				`}
				onMessage={(event) => {
					try {
						const data = JSON.parse(event.nativeEvent.data);
						if (data.type === "certificateDownload") {
							Alert.alert(
								"Certificate Download",
								"Certificate downloads work best in your browser. Open exam dashboard in browser?",
								[
									{ style: "cancel", text: "Cancel" },
									{
										onPress: () => {
											Linking.openURL(`${SITE_LINK}/dashboard/exam`).catch(() => {
												Alert.alert("Error", "Failed to open browser.");
											});
										},
										text: "Open Browser",
									},
								]
							);
						}
					} catch (error) {
						console.error("Error parsing message:", error);
					}
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#000",
		flex: 1,
		overflow: "hidden",
		width: "100%",
	},
	errorContainer: {
		alignItems: "center",
		backgroundColor: "#000",
		flex: 1,
		justifyContent: "center",
		padding: 20,
	},
	errorText: {
		color: "#fff",
		fontSize: 16,
		lineHeight: 24,
		marginBottom: 10,
		textAlign: "center",
	},
	errorTitle: {
		color: "#FF3B30",
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	loadingContainer: {
		alignItems: "center",
		backgroundColor: "#000",
		bottom: 0,
		justifyContent: "center",
		left: 0,
		position: "absolute",
		right: 0,
		top: 0,
		zIndex: 1,
	},
	loadingSubtext: {
		color: "#888",
		fontSize: 14,
		marginTop: 10,
		textAlign: "center",
	},
	loadingText: {
		color: "#fff",
		fontSize: 18,
		marginTop: 20,
		textAlign: "center",
	},
	logo: {
		height: 120,
		marginBottom: 20,
		width: 120,
	},
	retryButton: {
		color: "#007AFF",
		marginTop: 10,
		textAlign: "center",
		textDecorationLine: "underline",
	},
	spinner: {
		marginBottom: 10,
		marginTop: 20,
	},
	webview: {
		flex: 1,
		width: "100%",
	},
});
