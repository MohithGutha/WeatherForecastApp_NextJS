import React from 'react'
import { LuEye, LuSunrise, LuSunset } from 'react-icons/lu'
import { FiDroplet } from 'react-icons/fi'
import { MdAir } from 'react-icons/md'
import { ImMeter } from 'react-icons/im'


export interface WeatherDetailsProps {
    visibility: string,
    humidity: string,
    windSpeed: string,
    airPressure: string,
    sunrise: string | null | undefined,
    sunset: string | null | undefined
}

export default function WeatherDetails(props: WeatherDetailsProps) {

    // Default values incase no props are passed
    const {
        visibility = "25km",
        humidity = "61%",
        windSpeed = "7 km/h",
        airPressure = "1012 hPa",
        sunrise,
        sunset,

    } = props;

    return (
        <>
            <SingleWeatherDetail icon={<LuEye/>} information="Visibility" value={visibility} />
            <SingleWeatherDetail icon={<FiDroplet/>} information="Humidity" value={humidity} />
            <SingleWeatherDetail icon={<MdAir/>} information="Wind Speed" value={windSpeed} />
            <SingleWeatherDetail icon={<ImMeter/>} information="Air Pressure" value={airPressure} />
            {sunrise && <SingleWeatherDetail icon={<LuSunrise/>} information="Sunrise" value={sunrise} />}
            {sunset && <SingleWeatherDetail icon={<LuSunset/>} information="Sunset" value={sunset} />}
        </>
    )
}

export interface SingleWeatherDetailProps{
    information: string,
    icon: React.ReactNode,
    value: string
}

function SingleWeatherDetail(props: SingleWeatherDetailProps){
    return (
        <div className='flex flex-col justify-between gap-2 items-center text-xs font-semibold text-black/80'>
            <p className='whitespace-nowrap'>{props.information}</p>
            <div className='text-3xl'>{props.icon}</div>
            <div>{props.value}</div>
        </div>
    )
}