import { ApolloServer }  from 'apollo-server'
import { PrismaClient } from '@prisma/client'
import  { typeDefs  } from './schemas/hotel'
import { resolvers } from './resolvers/hotel'
import {ExternalApiDatasource} from './datasources/externalApi'
import { DbHealthCheckService } from './services/dbhealthcheck'
import { LocalApiCheckService } from './services/localapicheck'
import { ExternalApiHealthCheckService } from './services/externalapicheck'
import { ComposeHealthCheck } from './services/composehealthcheck'
import { HotelService } from './services/hotel'

const externalApiBaseUrl =  process.env.EXTERNAL_API_URL
const prisma = new PrismaClient()
const externalApiDatasource =  new ExternalApiDatasource(externalApiBaseUrl)
const composeHealthCheck = new ComposeHealthCheck([new DbHealthCheckService(prisma), 
    new ExternalApiHealthCheckService(externalApiDatasource),
    new LocalApiCheckService()])

const hotelService = new HotelService(prisma, externalApiDatasource)

export const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    dataSources:()=> ({ externalApiDatasource }),
    context : (req)=>({ hotelService, composeHealthCheck })
});
