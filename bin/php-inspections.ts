#!/usr/bin/env node
import * as fs from 'fs';
import * as process from 'process';
import * as inspection from '../src/inspections';
import { TreeBuilder } from '../src/util/treeBuilder.util';
import { InspectionItemCollection, InspectionItem, InspectionInterface } from '../src/common/interfaces';

const strip = <(json: string, options?: {}) => string>require('strip-json-comments');

let configs: any = {};
if (fs.existsSync(process.cwd() + '/inspections.php.json')) {
    try {
        configs = JSON.parse(strip(fs.readFileSync(process.cwd() + '/inspections.php.json').toString()));
    } catch (_) {
        console.error(_.message + ` while reading '${process.cwd()}/inspections.php.json'`);
        process.exit(1);
    }
}

const configurations = configs;

if (process.argv.indexOf('--help') !== -1) {
    console.log("\n");
    console.log('+----------=============[ PHP Inspections]=============----------+');
    console.log('|                                                                |');
    console.log('|               Version: Dev                                     |');
    console.log('|                                                                |');
    console.log('+----------------------------------------------------------------+');
    console.log('|  --pretty: Outputs results as readable text                    |');
    console.log('+----------------------------------------------------------------+');
    console.log('|  --as-json: Outputs results as JSON (useful for 3rd party apps)|');
    console.log('+----------------------------------------------------------------+');
    console.log('|  --php5: Prevents any PHP7 only inspections for being performed|');
    console.log('+----------------------------------------------------------------+');
    console.log('|  --no-suppress: Will force-return all inspection results       |');
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

const isPretty = (process.argv.indexOf('--pretty') !== -1);
const isJSON = (!isPretty && process.argv.indexOf('--as-json') !== -1);
const isStrict = (process.argv.indexOf('--no-suppress') !== -1);
const isPHP7 = (process.argv.indexOf('--php5') === -1);

let inspections: InspectionInterface[] = [];

inspections.push(new inspection.DebugInspection(isStrict, configurations));
inspections.push(new inspection.FunctionsInspection(isStrict, configurations));
inspections.push(new inspection.ConditionsInspection(isStrict, configurations));
// 'DESIGN' rules group
if (!configurations.hasOwnProperty('design') ||
    (configurations.hasOwnProperty('design') && configurations.design.enable === undefined) ||
    (configurations.hasOwnProperty('design') && configurations.design.enable !== undefined)) {
    inspections.push(new inspection.EvalInspection(isStrict, <inspection.EvalInspectionConfiguration>configurations));
}

if (isPHP7) {
    inspections.push(new inspection.Php7Inspection(isStrict));
}

let target = process.argv.pop();
let treeWalker = new TreeBuilder(target);
let results: InspectionItemCollection[] = [];

let projectFiles: string[] = treeWalker.walk();
let cache: InspectionItemCollection[] = [];

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
        let inspectionResult = inspection.analyze(data.toString());
        let collection = <InspectionItemCollection>{
            targetFile: file,
            items: (inspectionResult.items.length > 0 ? inspectionResult.items : []) ,
            mtime: fs.lstatSync(file).mtime.getTime()
        };

        cache.push(collection);

        if (isPretty || (!isPretty && !isJSON)) {
            if (collection.items.length > 0) {
                console.log(` ---- Results for "${collection.targetFile}"`)
            }
            collection.items.forEach((item: InspectionItem) => {
                if (item === undefined) { return; }
                console.log(`[${severity[item.severity]}] "${item.message}" on line ${item.range.start.line+1}, column ${item.range.start.character+1}-${item.range.end.character+1}`);
            });
        }
    });

    if (isJSON && index === projectFiles.length-1) {
        console.log(JSON.stringify(cache.filter((collection: InspectionItemCollection) => {
            return collection.items.length > 0;
        })));
    }
});
