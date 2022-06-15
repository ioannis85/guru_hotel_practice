import { PrismaClient, Rooms, RoomsPrices } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment'
import _, { forEach, has, isArguments } from 'lodash'
import { ExternalApiDatasource } from "../datasources/externalApi";
import { getDateRanges, getDateRange } from "../utils/daterange";
import{getDate} from '../utils/dateparser'

export class HotelService {

    private prismaClient : PrismaClient
    private externalApi : ExternalApiDatasource 

    constructor(  prismaClient: PrismaClient,  externalApi: ExternalApiDatasource  ) {
        this.prismaClient = prismaClient
        this.externalApi = externalApi
    }


    private resultFormat(prices){
      const result ={}
      const arrayResult = []
      for(let i=0; i< prices.length; i++){
          const priceArray = prices[i]
          for(let j=0; j < priceArray.length; j++){
            const roomInfo = priceArray[j]
            
            if(!result[roomInfo.room_id]){
              result[roomInfo.room_id] = roomInfo
            } else {
                result[roomInfo.room_id].prices.push(... roomInfo.prices)
            }
          }
      }

      Object.keys(result).forEach(val=> arrayResult.push(result[val]) )
      console.log(arrayResult)
      return arrayResult
    
    }

    private priceFormat(prices:RoomsPrices[], roomId){
     return prices.filter(rp=> rp.room_id == roomId).map(p=>{
        return { amount: p.price, competitor_name: p.competitor_name, currency: p.currency, taxes: p.tax, date: moment(p.date).format("DD/MM/yyyy") }
      })
    }

    private async pricesFormat(rooms: Rooms[], dateRange) {
        const roomsIds = rooms.map(p=> p.room_id);
        const roomsPrices = await this.prismaClient.roomsPrices.findMany({ where: { room_id:{ in: roomsIds}, date:{gte: getDate( dateRange.initialDate), lt:  getDate(dateRange.endDate)} }})
        return rooms.map(p=> ({ room_id: p.room_id, room_name: p.room_name, room_type: p.room_type, prices: this.priceFormat(roomsPrices, p.room_id) }))
    }

   
   private async saveInternalPrices(externalPrices){
      const hotelId = externalPrices.hotel_id
      const prices = externalPrices.prices
      const roomsIds = Object.keys(prices)
      const roomsPrices = []
      for( let i: number=0; i< roomsIds.length; i++) {
        const roomId = roomsIds[i]
        const roomPrices = prices[roomId][0] //sanitize data
        if(roomPrices) {
          for(let j=0; j < roomPrices.length; j++){
            const price = roomPrices[j]
            const { date, booking, expedia, travel_com, guruhotel } = price
            roomsPrices.push({ price_id:uuidv4(), room_id: roomId, date:  getDate(date), competitor_name: 'booking',  price: booking.price, currency: booking.currency,  tax: booking.tax  })
            roomsPrices.push({ price_id:uuidv4(), room_id: roomId, date: getDate(date), competitor_name: 'expedia',  price: expedia.price, currency: expedia.currency,  tax: expedia.tax  })
            roomsPrices.push({ price_id:uuidv4(), room_id: roomId, date: getDate(date), competitor_name: 'travel_com',  price: travel_com.price, currency: travel_com.currency,  tax: travel_com.tax  })
            roomsPrices.push({ price_id:uuidv4(), room_id: roomId, date: getDate(date), competitor_name: 'guruhotel',  price: guruhotel.price, currency: guruhotel.currency,  tax: guruhotel.tax  })
          }
        }
      }
          await this.prismaClient.roomsPrices.createMany({data: roomsPrices})
          return roomsPrices
    }


    private async calculateMetrics(roomPrices: RoomsPrices[], rooms, date) {

      const dateStr = moment(date).format('DD/MM/yyyy')
      const roomPricesByRoom =  _.groupBy(roomPrices, p=> p.room_id)
      const keys = _.keys(roomPricesByRoom)
      const values = _.values(roomPricesByRoom)
      const metricsResult = []
      for(let i=0; i< keys.length; i ++) {
          const roomPrice =  values[i]
            //roomId
            const roomId = keys[i]  
            //room_name 
            const roomName = rooms.find(p=> p.room_id == roomId).room_name   
            const bestPrice = _.minBy(roomPrice, p=> p.price)
            const worsePrice = _.maxBy(roomPrice, p=> p.price)
            const avgPrice = _.meanBy(roomPrice, p=> p.price) 
            const metrics = {
              best_price: {
                competitor_name:  bestPrice.competitor_name,
                gross_amount : bestPrice.price - bestPrice.tax,  
                net_amount: bestPrice.price
              },
              average_price: {
                competitor_name: 'average price',
                gross_amount : avgPrice,  
                net_amount: avgPrice
              },
              worst_price : {
                competitor_name:  worsePrice.competitor_name,
                gross_amount : worsePrice.price - worsePrice.tax,  
                net_amount: worsePrice.price
              }
            }
            metricsResult.push({room_id: roomId, room_name: roomName, date: dateStr, metrics })
      }
      return metricsResult
    }


    private async processMetrics(hotelId, date, roomType){

      console.log(roomType)
      const totalRoomsByHotel = await this.prismaClient.rooms.count({where: { hotel_id: hotelId } })
      if(totalRoomsByHotel == 0){
        const roomsByHotel = await this.externalApi.getHotelRooms(hotelId)
        const roomsToInsert =  roomsByHotel.map( p=> Object.assign(p, { hotel_id: hotelId }))
        //save rooms in our mongodb 
        await this.prismaClient.rooms.createMany({ data: roomsToInsert })
      }
      const rooms = await this.prismaClient.rooms.findMany({ where: { hotel_id: hotelId,  room_type: roomType  }})
      const roomsIdsResult = rooms.map(p=> p.room_id)
      console.log(roomsIdsResult.length)
      const roomPrices = await this.prismaClient.roomsPrices.findMany({ where:{ date:date, room_id:{ in: roomsIdsResult } } })
     const metricsResult =  this.calculateMetrics(roomPrices, rooms, date)
     return metricsResult

    }

    async getRoomPrices(hotelId, period, roomType, limit) {

        await this.prismaClient.$connect()
        const hotelData = await this.prismaClient.hotels.findUnique({where: {  hotelId } })
        if(!hotelData){  // not exists in mongo db
           //load data for externalApi and populate info
            const hotelDataExternal = await this.externalApi.getHotelById(hotelId.toString());
            //save hotel data in mongodb
            const { city, name , state } = hotelDataExternal
            await  this.prismaClient.hotels.create({ data: { hotelId,  city: city , name: name, state: state } })
              // extract room property for result
              const { rooms } = hotelDataExternal
              // add hotel_is as reference to hotel
              const roomsCount = await this.prismaClient.rooms.count()
              if(roomsCount == 0){
                const roomsToInsert =  rooms.map( p=> Object.assign(p, { hotel_id: hotelId }))
                //save rooms in our mongodb 
                await this.prismaClient.rooms.createMany({ data: roomsToInsert })
              }
       }

            // get prices for rooms
            const dateranges = getDateRanges(period)
            let prices = []
            for(let i: number=0; i< dateranges.length; i ++ ) {
              const dateRange = dateranges[i]
              const roomsCache =  await this.prismaClient.cachingRoomKeys.findUnique({where: { key: `${hotelId}-${dateRange.initialDate}` } })
              if(roomsCache){
                const localRooms = (await this.prismaClient.rooms.findMany({
                     where: { hotel_id : hotelId, room_type: roomType  }, take: limit }))
               const  roomPrices =  await this.pricesFormat(localRooms, dateRange)
               prices.push(roomPrices)
             }
               else {
                    const pricesDataExternal =  await this.externalApi.getHotelRoomPrices( hotelId, dateRange.initialDate, dateRange.endDate);
                    const roomsPrices = await this.saveInternalPrices(pricesDataExternal)
                    await this.prismaClient.cachingRoomKeys.create({data: { id: uuidv4(), key: `${hotelId}-${dateRange.initialDate}` } })
                    const localRooms = (await this.prismaClient.rooms.findMany({
                      where: { hotel_id : hotelId, room_type: roomType  }, take: limit 
                    }))
                    const  roomPrices =  await this.pricesFormat(localRooms, dateRange)
                    prices.push(roomPrices)
              }

            }

            const result =  this.resultFormat(prices)
            return result
    }


    async getHotelMetrics(hotelId, day, roomType) {
      const date = getDate(day);
      const dateCache = moment(date).set('date', 1).format('DD/MM/yyyy')
      const cacheKey = `${hotelId}-${dateCache}`
      const roomsCache =  await this.prismaClient.cachingRoomKeys.findUnique({where: { key: cacheKey } })
      if(roomsCache){
          const metricsResult = this.processMetrics(hotelId, date, roomType)
          return metricsResult
        } 
        else {
          const dateRange = getDateRange(day)
          const pricesDataExternal =  await this.externalApi.getHotelRoomPrices( hotelId, dateRange.initialDate, dateRange.endDate)
          await this.saveInternalPrices(pricesDataExternal)
          await this.prismaClient.cachingRoomKeys.create({data: { id: uuidv4(), key: `${hotelId}-${dateRange.initialDate}` } })
          const metricsResult = this.processMetrics(hotelId, date, roomType)
          return metricsResult
        }

    }


}