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

const version = fse.readJSONSync("package.json").version;
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
                        streets.forEach((row) => t.push(row));

                        console.log("\n" + chalk.bold("Route:"));
                        console.log(t.toString());

                        process.exit(0);
                    }
                })
            }
        })();
    }
} else if (mainOptions.command === "timetable") {

} else if (mainOptions.command === undefined) {
    console.log(chalk.red("ERROR"), "Command not specified");
    console.log(`Use ${chalk.italic(chalk.blue("poznan-transport-cli help"))} for help`);
    process.exit(1);
} else {
    console.log(chalk.red("ERROR"), "Command not found");
    console.log(`Use ${chalk.italic(chalk.blue("poznan-transport-cli help"))} for help`);
    process.exit(1);
}
