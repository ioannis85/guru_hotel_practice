import { DbHealthCheckService } from "./dbhealthcheck";
import { ExternalApiHealthCheckService } from "./externalapicheck";
import { HelpCheckServiceBase } from "./healthcheck";
import { LocalApiCheckService } from "./localapicheck";




export class ComposeHealthCheck {

    healthCheckList: Array<HelpCheckServiceBase>

    constructor( healthCheckList : Array<HelpCheckServiceBase> ){
        this.healthCheckList = healthCheckList
    }

    async check() {
       const result = await Promise.all( await this.healthCheckList.map( async p=>{
            const r = {};
            r[p.origin()] = await p.check()
            return r
        }))
        return result.reduce((map:any,obj:any)=>{
            return Object.assign(map, obj)
        },{})
    }
}