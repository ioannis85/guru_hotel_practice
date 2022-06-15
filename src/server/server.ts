import { ApolloServer, AuthenticationError }  from 'apollo-server'
import { PrismaClient } from '@prisma/client'
import jsonwebtoken from 'jsonwebtoken'
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
    context : async (context)=>{
        const token = context.req.headers.authorization || '';
        if (!token) throw new AuthenticationError('jwt token missed');
        const tokenPayload = jsonwebtoken.decode(token, { json: true })
        if(!tokenPayload) throw new AuthenticationError('jwt token is invalid');
        const { userId, role } = tokenPayload
        await  prisma.$connect()
        const user = await prisma.users.findUnique({ where:{ user_id: userId } })
        console.log(user)
        if(!user) throw new AuthenticationError('user is invalid');
        const userData = { userId, role }
       return { userData, hotelService, composeHealthCheck }
    }
});
