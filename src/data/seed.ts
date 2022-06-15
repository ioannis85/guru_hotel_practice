import { Prisma, PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import jsonwebtoken from 'jsonwebtoken'
import { json } from "express";
import { config } from 'dotenv'
config()

const Data = {
     managerId : uuidv4(),
     publicId : uuidv4(),
    jwtSecret : process.env.JWT_SECRET
}

console.log(process.env.DATABASE_URL)

const tokenManager =  jsonwebtoken.sign({ userId: Data.managerId,  name:'Manager User', role:'Manager' }, Data.jwtSecret, { expiresIn: '10y' }) 
const tokenPublic  =  jsonwebtoken.sign({ userId: Data.publicId, name:'Public User', role: 'Public' },  Data.jwtSecret, { expiresIn: '10y' }) 

 const seedData = async ()=> {
    const prisma = new PrismaClient()
    await prisma.$connect()

    //ROLES
    await prisma.roles.createMany({ data:[
        { role_id: uuidv4(), role_name:'Manager' },
        { role_id: uuidv4(), role_name:'Public' }
    ]})


        //USERS
      await prisma.users.createMany({data:[
        {  user_id: Data.managerId, 
            username: 'Manager', 
            token: tokenManager
            },
            {  user_id: Data.publicId, 
                username: 'Public', 
                token:  tokenPublic
            }
      ]})

      console.log(`manager token: ${tokenManager} \n`)
      console.log('..................................................................................................')
      console.log(`public token: ${tokenPublic}`)
}

seedData()