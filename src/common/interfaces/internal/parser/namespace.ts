import { Identifier } from './identifier';
import { Statement } from './statement';

type UseType = 'function' | 'const' | null;

export interface Use extends Statement
{
    name: Identifier;
    type: UseType;
    alias: string|null;
}
