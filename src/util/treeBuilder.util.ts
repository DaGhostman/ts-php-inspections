import * as process from 'process';
import * as fs from 'fs';

export class TreeBuilder
{
    private stat: fs.Stats;
    public constructor(private target: string)
    {
        if (!fs.existsSync(target)) {
            console.error(`File or folder "${target}" does not exist`);
            process.exit(1);
        }

        this.stat = fs.lstatSync(target);
    }

    public walk(): string[]
    {
        let files = [];
        if (this.stat.isDirectory()) {
            let fps = fs.readdirSync(this.target);

            fps.forEach((fp: string) => {
                files = files.concat(
                    (new TreeBuilder(this.target.replace(/\/$/i, '') + '/' + fp))
                        .walk()
                );
            });
        };

        if (this.stat.isFile()) {
            files.push(this.target);
        }

        return files;
    }
}
