export const getDate = (strDate: string)=> {
    const dateParts =  strDate.split('/')
    return new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) -1, parseInt(dateParts[0]),0,0,0,0)
}