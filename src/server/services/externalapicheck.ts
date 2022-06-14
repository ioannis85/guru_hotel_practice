import { ExternalApiDatasource } from '../datasources/externalApi'
import{ HelpCheckServiceBase } from './healthcheck'

export class ExternalApiHealthCheckService extends HelpCheckServiceBase
{
    externalApi : ExternalApiDatasource

    constructor(externalApi){
        super()
        this.externalApi = externalApi
    }

    async check(): Promise<boolean> {
        try {
            const result = await this.externalApi.ping()
            return result.healthy
        }
        catch(e) {
            return false
        }
    }

    origin(): string {
        return "external_api"
    }
}