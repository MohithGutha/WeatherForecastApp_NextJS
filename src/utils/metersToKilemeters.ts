export function metersToKilometers(visibilityInMeters: number):string{
    const visibilityInKilometers = visibilityInMeters / 1000 ;
    // Rounding to unit decimal place
    return `${visibilityInKilometers.toFixed(0)}km`
}