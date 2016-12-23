import * as fs from 'fs';
import * as process from 'process';
import * as inspection from '../src/inspections';
import { TreeBuilder } from '../src/util/treeBuilder.util';
import { InspectionItemCollection, InspectionItem, InspectionInterface } from '../src/common/interfaces';


if (process.argv.indexOf('--help') !== -1) {
    console.log("\n");
    console.log('+----------=============[ PHP Inspections]=============----------+');
    console.log('|  Version: Dev                                                  |');
    console.log('+----------------------------------------------------------------+');
    console.log('|  --pretty: Outputs results as readable text                    |');
    console.log('|  --as-json: Outputs results as JSON (useful for 3rd party apps)|');
    console.log('+----------------------------------------------------------------+');
}
if (process.argv.length === 2) {
    console.error('Not enough arguments');
    process.exit(1);
}

if (!fs.existsSync(process.argv[process.argv.length-1]) && !fs.existsSync(process.argv[process.argv.length-1])) {
    console.log("\n");
    console.error('Error: Last argument must be the file/directory to inspect');
    console.log("\n");
    process.exit(1);
}

let inspections: InspectionInterface[] = [];

inspections.push(new inspection.DebugInspection());
inspections.push(new inspection.FunctionsInspection());
inspections.push(new inspection.ConditionsInspection());

if (process.argv.indexOf('--php5') === -1) {
    inspections.push(new inspection.Php7Inspection())
}

let target = process.argv.pop();
let treeWalker = new TreeBuilder(target);
let results: InspectionItemCollection[] = [];

let projectFiles: string[] = treeWalker.walk();
let cache: InspectionItemCollection[] = [];

var isPretty = (process.argv.indexOf('--pretty') !== -1);
var isJSON = (!isPretty && process.argv.indexOf('--as-json') !== -1);

if (!isPretty && !isJSON) {
    // We have to get some output right :)
    isPretty = true;
}
// console.log(projectFiles);
let lines = [];
let severity = [
    'CRITICAL',
    'ERROR',
    'WARNING',
    'NOTICE',
    'INFO'
];
projectFiles.forEach((file: string, index: number) => {
    let data = fs.readFileSync(file);

    inspections.forEach((inspection) => {
        let r =inspection.analyze(data.toString());
        if (r.items.length !== 0) {
            r.targetFile = file;
            r.mtime = fs.lstatSync(file).mtime.getTime();
            cache.push(r);
        }

        if (isPretty) {
            r.items.forEach((item: InspectionItem) => {
                if (item === undefined) {
                    return;
                }
                lines.push(`[${severity[item.severity]}] "${item.message}" in ./${r.targetFile} on line ${item.range.start.line}, column ${item.range.start.character+1}-${item.range.end.character+1}`);
            });
        }
    });

    if (isPretty && index === projectFiles.length-1) {
        console.log('');
        console.warn(lines.join("\n"));
        console.log('');
    }

    if (isJSON && index === projectFiles.length-1) {
        console.log(JSON.stringify(cache));
    }
});
