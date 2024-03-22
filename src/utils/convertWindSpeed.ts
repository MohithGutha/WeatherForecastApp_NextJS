export function convertWindSpeed(speedInMetersPerSecond: number):string{
    const speedInKiloMetersPerHour = speedInMetersPerSecond * 3.6 ;
    return `${speedInKiloMetersPerHour.toFixed(0)} km/h`
}