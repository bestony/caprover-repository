const { storeBaseUrl } = require("../../lib/apps");

module.exports = function siteData() {
    return {
        title: "CapRover Store",
        description: "A minimal CapRover one-click app repository",
        url: storeBaseUrl(),
    };
};
