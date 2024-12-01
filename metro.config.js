// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

/* Ignoring mocks folder and .test.tsx files when bundling */
config.resolver.blockList = [
    /mocks\/.*/,
    /.*\.test\.tsx/
]

module.exports = config;
