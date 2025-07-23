function checkApiKey() {
  const key = PropertiesService.getScriptProperties().getProperty("anton-vs-lappe-api-key");
  Logger.log("Stored API key: " + (key || "No key found"));
}