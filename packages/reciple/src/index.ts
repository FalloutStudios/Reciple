import { RecipleClient as Client } from '@reciple/core';
import { RecipleConfig } from './classes/Config';

export * from '@reciple/core';
export * from './exports';

// TODO: Fix types
export declare class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    readonly config: RecipleConfig;
}
