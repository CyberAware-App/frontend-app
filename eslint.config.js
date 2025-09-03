import { zayne } from "@zayne-labs/eslint-config";

export default zayne({
	expo: true,
	ignores: ["dist/**", "build/**", ".expo/**", "scripts"],
	react: true,
});
