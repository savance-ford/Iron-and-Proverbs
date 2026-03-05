import { Redirect } from "expo-router";

/**
 * Root route ("/")
 *
 * Without this file, Expo Router will immediately show the "+not-found" screen
 * because there is no matching route for "/".
 *
 * This app's main entry is the Tabs group, so we redirect to the first tab.
 */
export default function Index() {
  return <Redirect href="/home" />;
}
