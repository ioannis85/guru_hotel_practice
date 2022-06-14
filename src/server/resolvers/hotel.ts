 
// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
export const resolvers = {
    Query: {
        getHotelInsights: async (parent, { hotel_id, period, room_type, limit } , { hotelService}) =>  { 
            try {
               const result = await hotelService.getRoomPrices(hotel_id, period, room_type, limit)
               return result
            }
           catch(e){
               console.log(e)
           }
        },

      ping: async( parent, args, { composeHealthCheck }, info )=> {
        const result = await composeHealthCheck.check()
        return result
      },

      getHotelMetrics: async( parent, { hotel_id, day, room_type }, { hotelService }, info ) => {
        try{
          const result = await hotelService.getHotelMetrics(hotel_id, day, room_type)
          return result
        }
        catch(e){
          console.log(e)
        }
        
      }

    },
  };
