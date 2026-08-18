const { loadApps } = require("../lib/apps");
const logger = require("../lib/logger");

try {
    const apps = loadApps();
    logger.info("validate", "all apps passed validation", {
        count: apps.length,
        names: apps.map((app) => app.name),
    });
} catch (error) {
    logger.error("validate", "app validation failed", { error: error.message });
    process.exit(1);
}
