import moment  from 'moment'

export const getDateRanges = (period : string)=> {

    const periodValues = {
        Monthly  : 1,
        Bimonthly : 2,
        Quarterly : 3,
    }
    const periodVal : number =  periodValues[period]
    const currentDate = moment()

    const dateRanges =  [] 
  
    for( var i = 0; i < periodVal; i ++ ) {
        const currentMonth = currentDate.month()
        const initialDay = 1
        const endDay = currentDate.daysInMonth()
        const initialDate = moment(new Date(currentDate.year(), currentDate.month() , 1 )).format('DD/MM/yyyy')
        const endDate = moment(new Date(currentDate.year(), currentDate.month()  , endDay )).format('DD/MM/yyyy')
        dateRanges.push({ initialDate, endDate  })
        currentDate.add(1, 'month')
    }
    return dateRanges

} 