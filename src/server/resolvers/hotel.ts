 
  import { AuthenticationError } from 'apollo-server';
  import { ROLES } from '../config/constants'
  import { AuthorizeError } from '../Errors/autherror';
  
  const isInRole = (userData, role)=>{
      return userData.role == role
  } 

export const resolvers = {
    Query: {
        getHotelInsights: async (parent, { hotel_id, period, room_type, limit } , { userData, hotelService}) =>  { 
            try {
                if(!isInRole(userData, ROLES.MANAGER)){
                  throw new AuthorizeError('User is unauthorized for this action');
                }
                const result = await hotelService.getRoomPrices(hotel_id, period, room_type, limit)
                return result
                
            }
           catch(e){
               console.log(e)
               throw e
           }
        },

      ping: async( parent, args, { userData, composeHealthCheck }, info )=> {
        if(!isInRole(userData, ROLES.PUBLIC)){
          throw new AuthorizeError('User is unauthorized for this action');
        }
        const result = await composeHealthCheck.check()
        return result
      },

      getHotelMetrics: async( parent, { hotel_id, day, room_type }, {userData, hotelService }, info ) => {
        try{
          if(!isInRole(userData, ROLES.MANAGER)){
            throw new AuthorizeError('User is unauthorized for this action');
          }

          const result = await hotelService.getHotelMetrics(hotel_id, day, room_type)
          return result
        }
        catch(e){
          console.log(e)
          throw e
        }
      }
    },
  };
