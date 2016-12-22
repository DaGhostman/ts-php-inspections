# ts-php-inspections

***Desclimer** I am by no means a full fledged JS developer, I am a PHP guy, so don't hate on me too much +
some things might not be implemented using the best approaches, so with that in mind. Feel free to give me a
hand in making this in something useful and we can learn some thing together :)*

***P.S** I used to hate on JS before, but since typescript I actually rediscovered JS and as such this project
will be only writte in TS, there are no plans to write it in ES2015/ES6 nor anything like that, deal with it*

## Info
This is a small CLI tool aiming to provide PHP code inspections written in typescript,
main intent came from my interest in working on VSCode instead of a full fledged IDE,
but since there are not enough decent extensions, I decided to go the hard way and build
this as a CLI tool in order to allow others, if interested, to be able to use the extension
with their preferred editor of choice.

Main inspiration for the inspections are those available in "PHPStorm" and the "PHP Inspections EA" plugin,
which had helped me to pick some good practices and also to become a more productive developer, so I will
try my best to port as much inspections as possible from that plugin.

## API
Honestly, there is not too much in terms of "API", but you can get all inspectino messages displayed in a
readable form by just using "php-inspections path-to-php-files" and you are done.

In order to use it with other tools, say Editor to parse it, pass `--as-json` before providing the path
(yes I am lazy and the last argument must always be the path to inspect otherwise a kitten will die),
the JSON output will contain a single root property: `items` and everything inside is an interface
implementation of the `InspectionItem` interface, so feel free to check the interface and experiment
a little I think everything is relatively simple.

## Contributing

Well, you know the drill, want something open an issue, if you feel like doing it
also open a PR (please open PRs against `develop`) and start working on the
feature/fix Ill do my best to keep everything running as much as I can

