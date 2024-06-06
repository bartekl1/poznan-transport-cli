#!/usr/bin/env node

const GtfsRealtimeBindings = require("gtfs-realtime-bindings");
const fetch = require("node-fetch");
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const fse = require("fs-extra");
const chalk = require("chalk");
const Table = require("terminal-table");
const JSZip = require("jszip");
const Papa = require("papaparse");

const path = require("path");

const version = fse.readJSONSync(path.join(__dirname, "package.json")).version;
const nodeVersion = process.versions.node;

const URLs = {
    vehiclePositions: "https://www.ztm.poznan.pl/pl/dla-deweloperow/getGtfsRtFile?file=vehicle_positions.pb",
    timetables: "https://www.ztm.poznan.pl/pl/dla-deweloperow/getGTFSFile",
    projectHome: "https://github.com/bartekl1/poznan-transport-cli",
};

async function fetchData(data) {
    try {
        var response = await fetch(URLs.timetables);
        if (!response.ok) {
            console.log(chalk.red("ERROR"), "HTTP error");
            console.log(`${response.url}: ${response.status} ${response.statusText}`);
            console.log("Please check your internet connection and try again later");
            process.exit(1);
        }
        var buffer = await response.arrayBuffer();
        var zip = await JSZip.loadAsync(buffer);
        var file = await zip.file(data + ".txt").async("string");
        var result = Papa.parse(file, { header: true }).data;
        return result;
    } catch (error) {
        console.log(chalk.red("ERROR"), "Fetch error");
        console.log(`${error.name}: ${error.message}`);
        console.log("Please check your internet connection and try again later");
        process.exit(1);
    }
}

const mainDefinitions = [
    { name: "command", defaultOption: true },
    { name: "help", alias: "h", type: Boolean },
    { name: "version", alias: "v", type: Boolean },
];
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const argv = mainOptions._unknown || [];

const sections = [
    {
        header: "Unofficial command line interface for ZTM Poznań API",
        content: "Check positions and timetables for buses and trams in Poznań",
    },
    {
        header: "VERSION",
        content: `poznan-transport-cli@${version} node@${nodeVersion} ${process.platform}-${process.arch}`,
    },
    {
        header: "USAGE",
        content: "$ poznan-transport-cli <command> <options>",
    },
    {
        header: "COMMANDS",
        content: [
            { name: "position", summary: "Vehicle position" },
            { name: "route", summary: "Routes" },
            { name: "timetable", summary: "Timetable" },
            { name: "version", summary: "Display version info" },
            { name: "help", summary: "Display this help message" },
        ],
    },
    {
        header: "GLOBAL OPTIONS",
        optionList: [
            {
                name: "help",
                description: "Display this help message",
                alias: "h",
                type: Boolean
            },
            {
                name: "version",
                description: "Display version info",
                alias: "v",
                type: Boolean
            },
        ]
    },
    {
        header: "PROJECT HOME",
        content: `{underline ${URLs.projectHome}}`,
    },
];

const usage = commandLineUsage(sections);

if (mainOptions.command === "help" || (mainOptions.help && mainOptions.command === undefined)) {
    console.log(usage);
} else if (mainOptions.command === "version" || mainOptions.version) {
    console.log(`poznan-transport-cli@${version} node@${nodeVersion} ${process.platform}-${process.arch}`);
    console.log(`From: ${__dirname}`);
} else if (mainOptions.command === "position") {
    const commandDefinitions = [
        { name: "line-number", alias: "l", type: Boolean },
        { name: "vehicle-number", alias: "n", type: Boolean },
        { name: "brigade-number", alias: "b", type: Boolean },
        { name: "search", type: String, defaultOption: true },
    ];
    const commandOptions = commandLineArgs(commandDefinitions, { argv });

    if ([commandOptions["line-number"], commandOptions["vehicle-number"], commandOptions["brigade-number"]].filter(x => x).length > 1) {
        console.log(chalk.red("ERROR"), "Invalid options");
        console.log(`Arguments ${chalk.italic(chalk.blue("--line-number"))}, ${chalk.italic(chalk.blue("--vehicle-number"))} and ${chalk.italic(chalk.blue("--brigade-number"))} can not be used at the same time.`);
        process.exit(1);
    }

    if ([commandOptions["line-number"], commandOptions["vehicle-number"], commandOptions["brigade-number"]].filter(x => x).length > 0 && commandOptions.search === undefined) {
        console.log(chalk.red("ERROR"), "Invalid options");
        console.log(`Search is required when using ${chalk.italic(chalk.blue("--line-number"))}, ${chalk.italic(chalk.blue("--vehicle-number"))} or ${chalk.italic(chalk.blue("--brigade-number"))} arguments.`);
        process.exit(1);
    }

    if (mainOptions.help) {
        const sections = [
            {
                header: "Position",
                content: "Get vehicle positions",
            },
            {
                header: "USAGE",
                content: "$ poznan-transport-cli position <options> <search>",
            },
            {
                header: "SEARCH",
                content: "You can search vehicle by line number (e.g. 401), vehicle number (e.g. 4045) or line number with brigade number (e.g. 401/8).\nIf several vehicles are found, all of them will be displayed.",
            },
            {
                header: "OPTIONS",
                optionList: [
                    {
                        name: "line-number",
                        description: "Search only by line number",
                        alias: "l",
                        type: Boolean
                    },
                    {
                        name: "vehicle-number",
                        description: "Search only by vehicle number",
                        alias: "n",
                        type: Boolean
                    },
                    {
                        name: "brigade-number",
                        description: "Search only by line number with brigade number",
                        alias: "b",
                        type: Boolean
                    },
                ]
            }
        ];
        const usage = commandLineUsage(sections);
        console.log(usage);
    } else {
        (async () => {
            try {
                var response = await fetch(URLs.vehiclePositions);
                if (!response.ok) {
                    console.log(chalk.red("ERROR"), "HTTP error");
                    console.log(`${response.url}: ${response.status} ${response.statusText}`);
                    console.log("Please check your internet connection and try again later");
                    process.exit(1);
                }
                var buffer = await response.arrayBuffer();
                var trips = await fetchData("trips");

                const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
                    new Uint8Array(buffer)
                );

                var t = new Table({
                    borderStyle: 2,
                    rightPadding: 1,
                    leftPadding: 1
                });
                t.push([chalk.bold("Line"), chalk.bold("Vehicle"), chalk.bold("Brigade"), chalk.bold("Position"), chalk.bold("Direction")]);
                t.push([""]);

                var found = false;

                feed.entity.forEach((entity) => {
                    if (commandOptions.search === undefined || (commandOptions.search === entity.vehicle.trip.routeId && commandOptions["line-number"]) || (commandOptions.search === entity.vehicle.vehicle.id && commandOptions["vehicle-number"]) || (commandOptions.search === entity.vehicle.vehicle.label && commandOptions["brigade-number"]) || ((commandOptions.search === entity.vehicle.trip.routeId || commandOptions.search === entity.vehicle.vehicle.id || commandOptions.search === entity.vehicle.vehicle.label) && commandOptions["line-number"] === undefined && commandOptions["vehicle-number"] === undefined && commandOptions["brigade-number"] === undefined)) {
                        var direction;
                        trips.forEach((trip) => {
                            if (trip.trip_id === entity.vehicle.trip.tripId) direction = trip.trip_headsign;
                        });
                        t.push([entity.vehicle.trip.routeId, entity.vehicle.vehicle.id, entity.vehicle.vehicle.label, `${entity.vehicle.position.latitude}, ${entity.vehicle.position.longitude}`, direction]);
                        found = true;
                    }
                });

                var tableString = t.toString();
                var tableArray = tableString.split("\n");
                tableArray[2] = tableArray[2].replaceAll(" ", t.border.mid);
                tableArray[2] = tableArray[2].replaceAll(t.border.sep, t.border.midMid);
                tableArray[2] = t.border.midLeft + tableArray[2].substring(1);
                tableArray[2] = tableArray[2].substring(0, tableArray[2].length - 1) + t.border.midRight;
                var headerWidths = [];
                tableArray[1].split(t.border.sep).forEach((e) => {
                    headerWidths.push(e.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/\[\d+m/g, "").length);
                });
                for (const [i, rowStr] of tableArray.slice(3).entries()) {
                    var row = rowStr.split(t.border.sep);
                    for (var [j, cell] of row.entries()) {
                        while (cell.length < headerWidths[j]) {
                            cell += " ";
                            row[j] += " ";
                        }
                    }
                    tableArray[i + 3] = row.join(t.border.sep)
                }
                tableString = tableArray.join("\n");
                
                if (found) console.log(tableString);
                else console.log("Not found any vehicles");
            } catch (error) {
                console.log(chalk.red("ERROR"), "Fetch error");
                console.log(`${error.name}: ${error.message}`);
                console.log("Please check your internet connection and try again later");
                process.exit(1);
            }
        })();
    }
} else if (mainOptions.command === "route") {
    const commandDefinitions = [
        { name: "search", type: String, defaultOption: true },
    ];
    const commandOptions = commandLineArgs(commandDefinitions, { argv });

    if (mainOptions.help) {
        const sections = [
            {
                header: "Route",
                content: "Get routes",
            },
            {
                header: "USAGE",
                content: "$ poznan-transport-cli route <search>",
            },
            {
                header: "SEARCH",
                content: "You can search vehicle by line number.",
            },
        ];
        const usage = commandLineUsage(sections);
        console.log(usage);
    } else {
        (async () => {
            var routes = await fetchData("routes");
            var agency = await fetchData("agency");

            if (commandOptions.search === undefined) {

                var t = new Table({
                    borderStyle: 2,
                    rightPadding: 1,
                    leftPadding: 1
                });
                t.push([chalk.bold("Line"), chalk.bold("Type"), chalk.bold("Direction"), chalk.bold("Agency")]);
                t.push([""]);

                routes.forEach((route) => {
                    if (route.route_id !== "") {
                        var agencyName;
                        agency.forEach((e) => { if (e.agency_id === route.agency_id) agencyName = e.agency_name });
                        t.push([route.route_id, {0: "Tram", 3: "Bus"}[route.route_type], route.route_long_name.split("|")[0], agencyName]);
                    }
                });

                var tableString = t.toString();
                var tableArray = tableString.split("\n");
                tableArray[2] = tableArray[2].replaceAll(" ", t.border.mid);
                tableArray[2] = tableArray[2].replaceAll(t.border.sep, t.border.midMid);
                tableArray[2] = t.border.midLeft + tableArray[2].substring(1);
                tableArray[2] = tableArray[2].substring(0, tableArray[2].length - 1) + t.border.midRight;
                var headerWidths = [];
                tableArray[1].split(t.border.sep).forEach((e) => {
                    headerWidths.push(e.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/\[\d+m/g, "").length);
                });
                for (const [i, rowStr] of tableArray.slice(3).entries()) {
                    var row = rowStr.split(t.border.sep);
                    for (var [j, cell] of row.entries()) {
                        while (cell.length < headerWidths[j]) {
                            cell += " ";
                            row[j] += " ";
                        }
                    }
                    tableArray[i + 3] = row.join(t.border.sep)
                }
                tableString = tableArray.join("\n");
                
                console.log(tableString);
            } else {
                routes.forEach((route) => {
                    if (route.route_id === commandOptions.search) {
                        var agencyName;
                        agency.forEach((e) => { if (e.agency_id === route.agency_id) agencyName = e.agency_name });

                        console.log(chalk.bold(`ROUTE ${route.route_id}`));
                        console.log(`${chalk.bold("Direction:")} ${route.route_long_name.split("|")[0]}`);
                        console.log(`${chalk.bold("Type:")} ${{0: "Tram", 3: "Bus"}[route.route_type]}`);
                        console.log(`${chalk.bold("Agency:")} ${agencyName}`);
                        if (route.route_desc.includes("NA LINII NIE OBOWIĄZUJE TARYFA ZTM")) console.log("ZTM tariff does not apply on the line");

                        var streets = [];
                        route.route_desc.split("|").forEach((e) => {
                            var streets2 = e.split("^")[0].split(" - ");
                            for (const [i, street] of streets2.entries()) 
                                if (street === street.toUpperCase()) streets2[i] = chalk.bold(street);
                            streets.push(streets2);
                        });
                        streets = streets[0].map((_, colIndex) => streets.map(row => row[colIndex]));

                        var t = new Table({
                            borderStyle: 2,
                            rightPadding: 1,
                            leftPadding: 1
                        });
                        t.push([""]);
                        streets.forEach((row) => t.push(row));

                        var tableString = t.toString();
                        var tableArray = tableString.split("\n");
                        var headerWidths = [];
                        tableArray[1].split(t.border.sep).forEach((e) => {
                            headerWidths.push(e.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/\[\d+m/g, "").length);
                        });
                        for (const [i, rowStr] of tableArray.slice(3).entries()) {
                            var row = rowStr.split(t.border.sep);
                            for (var [j, cell] of row.entries()) {
                                while (cell.length < headerWidths[j]) {
                                    cell += " ";
                                    row[j] += " ";
                                }
                            }
                            tableArray[i + 3] = row.join(t.border.sep)
                        }
                        tableArray.splice(1, 1);
                        tableString = tableArray.join("\n");

                        console.log("\n" + chalk.bold("Route:"));
                        console.log(tableString);

                        process.exit(0);
                    }
                })
            }
        })();
    }
} else if (mainOptions.command === "timetable") {
    const commandDefinitions = [
        { name: "search", type: String, defaultOption: true, multiple: true },
    ];
    const commandOptions = commandLineArgs(commandDefinitions, { argv });

    if (mainOptions.help) {
        const sections = [
            {
                header: "Timetable",
                content: "Get timetable for line and stop",
            },
            {
                header: "USAGE",
                content: "$ poznan-transport-cli timetable <line> <stop>",
            },
        ];
        const usage = commandLineUsage(sections);
        console.log(usage);
    } else {
        if (commandOptions.search === undefined || commandOptions.search.length !== 2) {
            console.log(chalk.red("ERROR"), "Line and stop ID required");
            console.log(`Use ${chalk.italic(chalk.blue("poznan-transport-cli timetable --help"))} for help`);
            process.exit(1);
        }

        (async () => {
            var calendar = await fetchData("calendar");
            var trips = await fetchData("trips");
            var stopTimes = await fetchData("stop_times");

            var routeTrips = {};
            var calendar_days = {};
            var timetable = {working_days: {}, saturdays: {}, sundays: {}};

            calendar.forEach((e) => {
                if (e.monday === "1" || e.tuesday === "1" || e.wednesday === "1" || e.thursday === "1" || e.friday === "1") calendar_days[e.service_id] = "working_days";
                if (e.saturday === "1") calendar_days[e.service_id] = "saturdays";
                if (e.sunday === "1") calendar_days[e.service_id] = "sundays";
            });

            trips.forEach((trip) => {
                if (trip.route_id === commandOptions.search[0]) {
                    routeTrips[trip.trip_id] = trip;
                }
            });

            ["working_days", "saturdays", "sundays"].forEach((e) => {
                for (var i = 0; i < 24; i++) timetable[e][String(i).padStart(2, '0')] = [];
            });

            stopTimes.forEach((e) => {
                if (e.stop_id === commandOptions.search[1] && Object.keys(routeTrips).includes(e.trip_id)) {
                    if (!timetable[calendar_days[routeTrips[e.trip_id].service_id]][e.departure_time.split(":")[0]].includes(e.departure_time.split(":")[1]))
                        timetable[calendar_days[routeTrips[e.trip_id].service_id]][e.departure_time.split(":")[0]].push(e.departure_time.split(":")[1]);
                }
            });

            for (var i = 0; i < 24; i++) {
                if (timetable.working_days[String(i).padStart(2, '0')].length === 0 && timetable.saturdays[String(i).padStart(2, '0')].length === 0 && timetable.sundays[String(i).padStart(2, '0')].length === 0) {
                    delete timetable.working_days[String(i).padStart(2, '0')];
                    delete timetable.saturdays[String(i).padStart(2, '0')];
                    delete timetable.sundays[String(i).padStart(2, '0')];
                } else break;
            }

            for (var i = 23; i >= 0; i--) {
                if (timetable.working_days.hasOwnProperty(String(i).padStart(2, '0')) && timetable.working_days[String(i).padStart(2, '0')].length === 0 && timetable.saturdays[String(i).padStart(2, '0')].length === 0 && timetable.sundays[String(i).padStart(2, '0')].length === 0) {
                    delete timetable.working_days[String(i).padStart(2, '0')];
                    delete timetable.saturdays[String(i).padStart(2, '0')];
                    delete timetable.sundays[String(i).padStart(2, '0')];
                } else break;
            }

            var maxWidth = 0;

            ["working_days", "saturdays", "sundays"].forEach((e) => {
                for (const [hour, minutes] of Object.entries(timetable[e])) {
                    timetable[e][hour] = minutes.sort().join(" ");
                    if (timetable[e][hour].length > maxWidth) maxWidth = timetable[e][hour].length;
                }
            });

            var tables = {
                working_days: new Table({
                    borderStyle: 2,
                    rightPadding: 1,
                    leftPadding: 1
                }),
                saturdays: new Table({
                    borderStyle: 2,
                    rightPadding: 1,
                    leftPadding: 1
                }),
                sundays: new Table({
                    borderStyle: 2,
                    rightPadding: 1,
                    leftPadding: 1
                }),
            };

            ["working_days", "saturdays", "sundays"].forEach((e) => {
                var hours = Object.keys(timetable[e]);
                hours.sort();
                
                for (const hour of hours) {
                    tables[e].push([hour, timetable[e][hour] + new Array(maxWidth - timetable[e][hour].length + 1).join(" ")]);
                }
            });

            var tableWidth = maxWidth + 9;
            console.log(` WORKDAYS${new Array(tableWidth - 9 + 3).join(" ")}SATURDAYS${new Array(tableWidth - 10 + 3).join(" ")}SUNDAYS`);

            tables.working_days.toString().split("\n").map(function(e, i) {
                return [e, tables.saturdays.toString().split("\n")[i], tables.sundays.toString().split("\n")[i]];
            }).forEach(e => {
                console.log(e.join(" "));
            })
        })();
    }
} else if (mainOptions.command === undefined) {
    console.log(chalk.red("ERROR"), "Command not specified");
    console.log(`Use ${chalk.italic(chalk.blue("poznan-transport-cli help"))} for help`);
    process.exit(1);
} else {
    console.log(chalk.red("ERROR"), "Command not found");
    console.log(`Use ${chalk.italic(chalk.blue("poznan-transport-cli help"))} for help`);
    process.exit(1);
}
