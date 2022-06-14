
import {RESTDataSource} from 'apollo-datasource-rest'
import { URLSearchParams } from 'apollo-server-env'

export class ExternalApiDatasource extends RESTDataSource {

    constructor( baseUrl:string ){
        super() 
        this.baseURL = baseUrl
    }


    async getHotelById(hotelId: string) {
        return this.get(`hotels/${hotelId}`)
    }

    async getHotelRoomPrices(hotelId: string, startDate: string, endDate: string ) {
        return this.get(`hotels/${hotelId}/prices`, new URLSearchParams({ start_date:startDate, end_date:endDate}))
    }

    async getHotelRooms(hotelId: string) {
        return this.get(`hotels/${hotelId}/rooms`)
    }

    async ping(){
        return this.get(`ping`,  { cacheOptions: { ttl: 1 } })
    }

}