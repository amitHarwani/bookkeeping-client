
const config = {
    preset: "jest-expo",
    transformIgnorePatterns: [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-redux)"
    ],
    setupFiles: ["./jest.setup.js"]
}

module.exports = config;  

