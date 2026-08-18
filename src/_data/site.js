const { publishedBaseUrl } = require("../../lib/apps");
const logger = require("../../lib/logger");
const storeConfig = require("../../config");

module.exports = function siteData() {
    const title = storeConfig.title;
    const description = storeConfig.description;
    const url = publishedBaseUrl();

    logger.debug("eleventy", "loading site config from root config.js", {
        title,
        description,
        url,
    });

    if (!title || !description) {
        logger.error("eleventy", "root config.js is missing title or description", {
            title,
            description,
        });
        throw new Error("config.js must export non-empty title and description");
    }

    return {
        title,
        description,
        url,
    };
};
