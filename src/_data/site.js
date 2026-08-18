const { publishedBaseUrl } = require("../../lib/apps");
const logger = require("../../lib/logger");
const storeConfig = require("../../config");

function nonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function normalizeKeywords(keywords) {
    if (Array.isArray(keywords)) {
        return keywords
            .map((item) => String(item || "").trim())
            .filter(Boolean)
            .join(", ");
    }
    if (typeof keywords === "string") {
        return keywords.trim();
    }
    return "";
}

module.exports = function siteData() {
    const title = storeConfig.title;
    const description = storeConfig.description;
    const keywords = normalizeKeywords(storeConfig.keywords);
    const stylesheet = storeConfig.stylesheet;
    const url = publishedBaseUrl();
    const repositoryUrl = nonEmptyString(storeConfig.repositoryUrl)
        ? storeConfig.repositoryUrl.trim()
        : "";
    const ogType = nonEmptyString(storeConfig.ogType) ? storeConfig.ogType.trim() : "website";
    const ogImage = nonEmptyString(storeConfig.ogImage) ? storeConfig.ogImage.trim() : "";

    logger.debug("eleventy", "loading site config from root config.js", {
        title,
        description,
        keywords,
        stylesheet,
        url,
        repositoryUrl,
        ogType,
        hasOgImage: Boolean(ogImage),
    });

    if (
        !nonEmptyString(title) ||
        !nonEmptyString(description) ||
        !nonEmptyString(keywords) ||
        !nonEmptyString(stylesheet) ||
        !nonEmptyString(url) ||
        !nonEmptyString(repositoryUrl)
    ) {
        logger.error("eleventy", "root config.js is missing required fields", {
            title,
            description,
            keywords,
            stylesheet,
            url,
            repositoryUrl,
        });
        throw new Error(
            "config.js must export non-empty title, description, keywords, stylesheet, url, and repositoryUrl"
        );
    }

    return {
        title,
        description,
        keywords,
        stylesheet,
        url,
        repositoryUrl,
        ogType,
        ogImage,
    };
};
