

export function getDayOrNight(
    icon_name: string,
    dateTimeString: string
): string {
  
    // Getting hours from the given dateTimeString
    const hours = new Date(dateTimeString).getHours();

    // Considering day time from 6am - 6pm
    const isDay = hours >= 6 && hours <18 
    
    return isDay ? icon_name.replace(/.$/, "d") : icon_name.replace(/.$/, "n")
}