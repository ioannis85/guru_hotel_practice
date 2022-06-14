import { PrismaClient } from '@prisma/client'
import{ HelpCheckServiceBase } from './healthcheck'

export class DbHealthCheckService extends HelpCheckServiceBase {

    prismaClient: PrismaClient

    constructor(prismaClient: PrismaClient) {
        super()
        this.prismaClient = prismaClient
    }

   async check(): Promise<boolean>{
        try {
                await this.prismaClient.$connect()
                return true
        } 
        catch(e) {
            return false
        }
    }

    origin(): string {
        return "db"
    }

}