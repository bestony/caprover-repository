const fs = require("fs");
const path = require("path");
const { loadApps, toCatalog } = require("../lib/apps");
const logger = require("../lib/logger");

const DIST_DIR = path.join(__dirname, "..", "dist");

function readJson(filePath) {
    logger.debug("verify", "reading json output", { filePath });
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing build output: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

try {
    const apps = loadApps();
    const list = readJson(path.join(DIST_DIR, "v4", "list"));
    const expected = toCatalog(apps);

    if (JSON.stringify(list) !== JSON.stringify(expected)) {
        logger.error("verify", "v4/list mismatch", { actual: list, expected });
        throw new Error("dist/v4/list does not match the app catalog");
    }

    apps.forEach((app) => {
        const definition = readJson(path.join(DIST_DIR, "v4", "apps", app.name));
        if (String(definition.captainVersion) !== "4") {
            throw new Error(`${app.name} is missing captainVersion 4`);
        }
        if (!definition.services || !definition.caproverOneClickApp) {
            throw new Error(`${app.name} is missing services or caproverOneClickApp`);
        }

        const logoPath = path.join(DIST_DIR, "v4", "logos", app.logoUrl);
        if (!fs.existsSync(logoPath)) {
            throw new Error(`Missing built logo: ${logoPath}`);
        }
        if (path.extname(logoPath) !== ".png") {
            throw new Error(`Published logo must be PNG: ${logoPath}`);
        }
        logger.debug("verify", "app output ok", {
            name: app.name,
            definitionPath: path.join("dist", "v4", "apps", app.name),
            logoPath: path.join("dist", "v4", "logos", app.logoUrl),
        });
    });

    const catalogPage = path.join(DIST_DIR, "index.html");
    if (!fs.existsSync(catalogPage)) {
        throw new Error("Missing catalog page dist/index.html");
    }

    const nojekyll = path.join(DIST_DIR, ".nojekyll");
    if (!fs.existsSync(nojekyll)) {
        throw new Error("Missing dist/.nojekyll for GitHub Pages");
    }

    logger.info("verify", "build output verified", {
        apps: apps.map((app) => app.name),
        listPath: "dist/v4/list",
    });
} catch (error) {
    logger.error("verify", "build verification failed", { error: error.message });
    process.exit(1);
}
