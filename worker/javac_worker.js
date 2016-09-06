/**
 * Lint Java files on the fly in Cloud9 using javac.
 * Language handler
 *
 * @author 2016, Tobias Bueschel.
 */
define(function (require, exports, module) {
    var baseHandler = require("plugins/c9.ide.language/base_handler");
    var handler = module.exports = Object.create(baseHandler);
    var workerUtil = require("plugins/c9.ide.language/worker_util");

    // activate language handler only on Java files
    handler.handlesLanguage = function (language) {
        return language === "java";
    };

    // gets called whenever a Java file is opened and starts javac
    handler.analyze = function (value, ast, options, callback) {
        var markers = [];
        var issues = [];
        var issueCount = 0;

        // -------------------------------------------------
        // execute javac
        // -------------------------------------------------
        workerUtil.execAnalysis(
            "javac",
            {
                mode: "tempfile",
                args: ["-verbose", "-Xlint", "$FILE"],
                maxCallInterval: 1200
            },
            function (err, stdout, stderr) {
                // Parse each line of output and create marker objects

                // TODO: update parsing to algorithm to work for javac
                (err + stdout + stderr).split("\n").forEach(function (line, index, arr) {
                    var match = line.match(/(.*?):(\d+):(\d+): (note|warning|error): (.*)/);

                    // log the last
                    if (index === arr.length - 1) {
                        var match2 = line.match(/(\d+) (\w+).+(\d+) (\w+)/);

                        if (!match) {
                            return;
                        }
                        issueCount++;
                        var warningCount = match2[1];
                        var warningText = match2[2];
                        var errorCount = match2[3];
                        var errorText = match2[4];

                        return;
                    } else if (!match) {
                        return;
                    } else if (issueType === "note") {
                        // javac has an issue type called note
                        // todo: decide whether such issues should be reported as markers or global errors
                        console.log("found a :", issueType);
                        return;
                    }
                    issueCount++;
                    var fullError = match[0];
                    var filePath = match[1];
                    var row = match[2];
                    var column = match[3];
                    var issueType = match[4];
                    var issueMsg = match[5];

                    markers.push({
                        pos: {
                            sl: parseInt(row, 10) - 1,
                            el: parseInt(row, 10) - 1,
                            sc: parseInt(column, 10) - 1,
                            ec: parseInt(column, 10)
                        },
                        message: issueMsg,
                        level: issueType
                    });
                });

                // --------------------------------------------------------------------
                // finished executing javac & draw markers
                callback(null, markers);
            }
        );
    };
});
