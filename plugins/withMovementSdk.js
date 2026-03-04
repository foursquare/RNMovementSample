const {
  withAppDelegate,
  withMainApplication,
  withProjectBuildGradle,
} = require("@expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");

function withMovementSdkIOS(config, { consumerKey, consumerSecret }) {
  return withAppDelegate(config, (cfg) => {
    cfg.modResults.contents = mergeContents({
      src: cfg.modResults.contents,
      newSrc: "import MovementSdk",
      anchor: "import React",
      offset: 1,
      tag: "movement-sdk-import",
      comment: "//",
    }).contents;

    cfg.modResults.contents = mergeContents({
      src: cfg.modResults.contents,
      newSrc: `    MovementSdkManager.shared.configure(withConsumerKey: "${consumerKey}", secret: "${consumerSecret}")`,
      anchor: "didFinishLaunchingWithOptions: launchOptions",
      offset: 0,
      tag: "movement-sdk-init",
      comment: "//",
    }).contents;

    return cfg;
  });
}

function withMovementSdkAndroid(config, { consumerKey, consumerSecret }) {
  return withMainApplication(config, (cfg) => {
    cfg.modResults.contents = mergeContents({
      src: cfg.modResults.contents,
      newSrc: [
        "import com.foursquare.movement.LogLevel",
        "import com.foursquare.movement.MovementSdk",
      ].join("\n"),
      anchor: "import android.app.Application",
      offset: 1,
      tag: "movement-sdk-imports",
      comment: "//",
    }).contents;

    cfg.modResults.contents = mergeContents({
      src: cfg.modResults.contents,
      newSrc: [
        `    val builder = MovementSdk.Builder(this)`,
        `        .consumer("${consumerKey}", "${consumerSecret}")`,
        `        .logLevel(LogLevel.DEBUG)`,
        `        .enableDebugLogs()`,
        `    MovementSdk.with(builder)`,
      ].join("\n"),
      anchor: "super\\.onCreate\\(\\)",
      offset: 1,
      tag: "movement-sdk-init",
      comment: "//",
    }).contents;

    return cfg;
  });
}

function withMovementSdkMavenRepo(config) {
  return withProjectBuildGradle(config, (cfg) => {
    cfg.modResults.contents = mergeContents({
      src: cfg.modResults.contents,
      newSrc:
        "    maven { url 'https://foursquare.jfrog.io/artifactory/libs-release/' }",
      anchor: "maven { url 'https://www.jitpack.io' }",
      offset: 1,
      tag: "movement-sdk-maven",
      comment: "//",
    }).contents;

    return cfg;
  });
}

module.exports = function withMovementSdk(config, props = {}) {
  config = withMovementSdkIOS(config, props);
  config = withMovementSdkAndroid(config, props);
  config = withMovementSdkMavenRepo(config);
  return config;
};
