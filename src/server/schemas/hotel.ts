import {  gql  }  from 'apollo-server';

export    const typeDefs  =  gql `
type Room {

    room_id : String
    room_name: String
    room_type:RoomType
    prices: [Prices]
    last_updated_at: String
   }


type Prices {
    competitor_name: String
    currency: String
    taxes: Float
    amount: Float
    date: String
}



   enum RoomType {
   
       residential
       business
   }

   enum Period {
       Monthly  
       Bimonthly 
       Quarterly
   }
   
   type PingResult {
       db: Boolean 
       local_api: Boolean
       external_api: Boolean
   }


   type RoomMetricsResult {
    room_id : String
    room_name: String
    date: String
    metrics : Metrics
   }


  type Metrics {
      best_price : MetricsResult
      average_price : MetricsResult
      worst_price : MetricsResult
  }

  type  MetricsResult {
    competitor_name : String
	gross_amount : Float
    net_amount : Float
  }

   type Query {
       getHotelInsights(hotel_id: Int, period: Period , room_type: RoomType, limit: Int): [Room]
       ping: PingResult
       getHotelMetrics(hotel_id: Int, day: String, roomt_type: RoomType) : [RoomMetricsResult]
     } 
`



