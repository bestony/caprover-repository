const { loadApps } = require("./lib/apps");
const { publishLogos } = require("./lib/logos");
const logger = require("./lib/logger");

module.exports = function (eleventyConfig) {
    eleventyConfig.configureErrorReporting({ allowMissingExtensions: true });
    eleventyConfig.addWatchTarget("templates/");

    eleventyConfig.on("eleventy.before", ({ directories }) => {
        logger.info("eleventy", "build starting", {
            input: directories.input,
            output: directories.output,
        });
    });

    eleventyConfig.on("eleventy.after", async ({ dir, results }) => {
        const apps = loadApps();
        await publishLogos(apps, dir.output);
        logger.info("eleventy", "build complete", {
            output: dir.output,
            files: results.map((result) => result.outputPath),
            logos: apps.map((app) => `v4/logos/${app.logoUrl}`),
        });
    });

    return {
        dir: {
            input: "src",
            output: "dist",
            includes: "_includes",
            data: "_data",
        },
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
    };
};
