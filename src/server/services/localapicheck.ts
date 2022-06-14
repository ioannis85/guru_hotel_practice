import { HelpCheckServiceBase } from './healthcheck'


export class LocalApiCheckService extends HelpCheckServiceBase
{
    constructor(){
        super()
    }

    async check(): Promise<boolean> {
        return await Promise.resolve(true)
    }

    origin(): string {
        return "local_api"
    }

}