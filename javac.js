/**
 * Lint Java files on the fly in Cloud9 using javac.
 *
 * @author 2016, Tobias Bueschel.
 */
define(function (require, exports, module) {
    main.consumes = ["language", "menus", "Plugin", "ui"];
    main.provides = ["javac"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var plugin = new Plugin("javac", main.consumes);
        var language = imports.language;
        var ui = imports.ui;
        var menus = imports.menus;

        // -------------------------------------------------
        // LOAD & HANDLE PLUGIN
        // -------------------------------------------------
        plugin.on("load", function (e) {

            // TODO:
            menus.addItemByPath("Tools/Linter-Javac", new ui.item({
                command: "unload"
            }), 300, plugin);

            // -------------------------------------------------
            // REGISTER LANGUAGE HANDLER
            // -------------------------------------------------
            language.registerLanguageHandler("plugins/c9.linter.javac/worker/javac_worker", function (err, handler) {
                // handle errors
                if (err) {
                    return console.error(err);
                }
            }, plugin);
        });

        // -------------------------------------------------
        // REGISTER CLOUD9 PLUGIN
        // -------------------------------------------------
        register("", {
            javac: plugin
        });
    }
});
