#!/usr/bin/env node

const GtfsRealtimeBindings = require("gtfs-realtime-bindings");
const fetch = require("node-fetch");
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const fse = require("fs-extra");
const chalk = require("chalk");

const version = fse.readJSONSync("package.json").version;
const nodeVersion = process.versions.node;

const mainDefinitions = [
    { name: "command", defaultOption: true },
    { name: "help", alias: "h", type: Boolean },
    { name: "version", alias: "v", type: Boolean },
];
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const argv = mainOptions._unknown || [];

// console.log("mainOptions\n===========");
// console.log(mainOptions);

// if (mainOptions.command === "merge") {
//     const mergeDefinitions = [
//       { name: "squash", type: Boolean },
//       { name: "message", alias: "m" }
//     ];
//     const mergeOptions = commandLineArgs(mergeDefinitions, { argv });
  
//     console.log("\nmergeOptions\n============");
//     console.log(mergeOptions);
// }

const sections = [
    {
        header: "Unofficial command line interface for ZTM Poznań API",
        content: "Check vehicle positions and timetables for buses and trams in Poznań",
    },
    {
        header: "VERSION",
        content: `poznan-transport-cli@${version} node@${nodeVersion} ${process.platform}-${process.arch}`,
    },
    {
        header: "USAGE",
        content: "$ poznan-transport-cli <global_options> <command> <command_options>",
    },
    {
        header: "COMMANDS",
        content: [
            { name: "position", summary: "Vehicle position" },
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
        content: "{underline https://github.com/bartekl1/poznan-transport-cli}",
    },
]

const usage = commandLineUsage(sections)

if (mainOptions.command === "help" || mainOptions.help) {
    console.log(usage);
} else if (mainOptions.command === "version" || mainOptions.version) {
    console.log(`poznan-transport-cli@${version} node@${nodeVersion} ${process.platform}-${process.arch}`);
    console.log(`From: ${__dirname}`);
} else if (mainOptions.command === "position") {

} else if (mainOptions.command === "timetable") {

} else if (mainOptions.command === undefined) {
    console.log(chalk.red("ERROR"), "Command not specified");
    console.log(`Use ${chalk.italic(chalk.blue("poznan-transport-cli help"))} for help`)
} else {
    console.log(chalk.red("ERROR"), "Command not found");
    console.log(`Use ${chalk.italic(chalk.blue("poznan-transport-cli help"))} for help`)
}

// fetch("https://www.ztm.poznan.pl/pl/dla-deweloperow/getGtfsRtFile?file=vehicle_positions.pb")
// .then((response) => {
//     if (!response.ok) {
//         const error = new Error(
//             `${response.url}: ${response.status} ${response.statusText}`
//         );
//         error.response = response;
//         throw error;
//         process.exit(1);
//     }

//     return response.arrayBuffer();
// })
// .then((buffer) => {
//     const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
//         new Uint8Array(buffer)
//     );
//     feed.entity.forEach((entity) => {
//         if (entity.vehicle.trip.routeId === "401") {
//             console.log(`${entity.vehicle.position.latitude}, ${entity.vehicle.position.longitude}`);
//             // require("child_process").exec(`start https://www.google.pl/maps/place/${entity.vehicle.position.latitude},${entity.vehicle.position.longitude}`);
//         }
//     });
// });
