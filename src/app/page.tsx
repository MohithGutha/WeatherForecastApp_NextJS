"use client"

import NavBar from "@/components/NavBar";
import { useQuery } from "react-query";
import axios from "axios";
import {format, parseISO, fromUnixTime} from 'date-fns';
import Container from "@/components/Container";
import { convertKelvinToCelsius } from "@/utils/convertKelvintoCelsius";
import WeatherIcon from "@/components/WeatherIcon";
import { getDayOrNight } from "@/utils/getDayOrNight";
import WeatherDetails from "@/components/WeatherDetails";
import {metersToKilometers} from '@/utils/metersToKilemeters';
import {convertWindSpeed} from '@/utils/convertWindSpeed'
import ForecastWeatherDetails from "@/components/ForecastWeatherDetails";
import { useAtom } from 'jotai';
import { locationAtom, loadingLocation } from '@/utils/location';
import { useEffect } from "react";

// api : `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`

// https://api.openweathermap.org/data/2.5/forecast?q=tirupati&appid=3e1f6ac894ba9b4081a5dfbb185841c7&cnt=2

interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export default function Home() {

  // const place = 'tirupati';
  
  const [location, setLocation] = useAtom(locationAtom);
  const [loadingPage] = useAtom(loadingLocation); // using '_', as the is no use of declaring it as we won't be using



  const { isLoading, error, data, refetch } = useQuery<WeatherData>(
    'repoData', 
    async () => {
      const {data} = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY}&cnt=56`);
      return data;
    }
  );

  useEffect(()=>{
    refetch(); // using refetch (part of useQuery) to re-fecth data when dependencies change
  },[location, refetch])

  const firstData = data?.list[0];

  // console.log(data);

  // Finding unique date entries for 7-day forecast
  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  // Filtering data to get the first entry after 6am for each unique date
  const firstDataForEachDate = uniqueDates.map((date)=>{
    return data?.list.find((entry) => {
      const dateObject = new Date(entry.dt * 1000);
      const entryDate = dateObject.toISOString().split("T")[0];
      const entryTime = dateObject.getHours();
      return entryDate === date && entryTime >= 6;
    })
  })

  // Group data by date
  const groupedData: Record<string, WeatherDetail[]> = {};
  data?.list.forEach(entry => {
    const dateKey = format(parseISO(entry.dt_txt), 'yyyy-MM-dd');
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = [];
    }
    groupedData[dateKey].push(entry);
  });


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-bounce">Loading...</p>
      </div>
    )
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen"> 
      <NavBar location={data?.city.name}/>
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {loadingPage ? (
          <WeatherSkeleton />
        ) : (
        <>
        {/* Today data */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-end">
              <p> {format(parseISO(firstData?.dt_txt ?? ''), 'EEEE')} </p>
              <p className="text-lg"> ({format(parseISO(firstData?.dt_txt ?? ''), 'dd.MM.yyyy')}) </p>
            </h2>
            <Container className="gap-10 px-6 items-center">
              {/* Temperature */}
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvinToCelsius(firstData?.main.temp ?? 0)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feels like</span>
                  <span>
                    {convertKelvinToCelsius(firstData?.main.feels_like ?? 0)}°
                  </span>
                </p>
                <p className="text-xs space-x-2">
                  <span>
                    {convertKelvinToCelsius(firstData?.main.temp_min ?? 0)}
                    °↓{" "}
                  </span>
                  <span>
                    {" "}
                    {convertKelvinToCelsius(firstData?.main.temp_max ?? 0)}
                    °↑
                  </span>
                </p>
              </div>
              {/* Time & Weather icon */}
              {/* <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list.map((data, index) =>
                  <div 
                    key={index}
                    className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                  >
                    <p className="whitespace-nowrap">
                      {format(parseISO(data.dt_txt), 'h:mm a')}
                    </p>
                    <WeatherIcon
                      icon_name={getDayOrNight(data.weather[0].icon, data.dt_txt)}
                    />
                    <p className="text-center">{convertKelvinToCelsius(data.main.temp ?? 0)}°</p>
                  </div>
                )}
              </div> */}
              <div className="flex  overflow-x-auto w-full justify-between pr-3">
                {Object.entries(groupedData).map(([date, entries]) => (
                  <div key={date} className="flex gap-2 items-center text-xs font-semibold">
                    {/* <p className="">{format(parseISO(date), 'MMMM dd, yyyy')}</p> */}
                    <p className="whitespace-nowrap">{format(parseISO(date ?? ""), "LLL dd")}</p>
                    {entries.map((entry, index) => (
                      <div key={index} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                        <p className="whitespace-nowrap">
                          {format(parseISO(entry.dt_txt), 'h:mm a')}
                        </p>
                        <WeatherIcon
                          icon_name={getDayOrNight(entry.weather[0].icon, entry.dt_txt)}
                        />
                        <p className="text-center">{convertKelvinToCelsius(entry.main.temp ?? 0)}°</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Container>
          </div>
          <div className="flex gap-4">
            {/* left */}
            <Container className="w-fit justify-center flex-col px-4 items-center ">
              <p className="capitalize text-center">
                {firstData?.weather[0].description}
              </p>
              <WeatherIcon
                icon_name={
                  getDayOrNight(
                    firstData?.weather[0].icon ?? "", 
                    firstData?.dt_txt ?? ""
                  )
                }
              />
            </Container>

            {/* right */}
            <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
              <WeatherDetails
                visibility = {metersToKilometers(firstData?.visibility ?? 10000)}
                humidity = {`${firstData?.main.humidity}%`}
                windSpeed = {convertWindSpeed(firstData?.wind.speed ?? 10000)}
                airPressure = {`${firstData?.main.pressure} hPa`}
                sunrise = {format(fromUnixTime(data?.city.sunrise ?? 1705367363), "H:mm")}
                sunset = {format(fromUnixTime(data?.city.sunset ?? 1705367363), "H:mm")}
              />
            </Container>

          </div>
        </section>
        
        {/* 7 Day forecast data */}
        <section className="flex flex-col w-full gap-4">
          <p className="text-2xl">Forecast (7 days)</p>
          {firstDataForEachDate.map((d, i)=>(
            <ForecastWeatherDetails
              key={i}
              weatherIcon = {d?.weather[0].icon ?? "01d"}
              // date = {format(parseISO(d?.dt_txt ?? ""), "LLL dd")}
              date = {d?.dt_txt ? format(parseISO(d?.dt_txt ?? ""), "LLL dd") : ""}
              // day = {format(parseISO(d?.dt_txt ?? ""), "EEEE")}
              day = {d?.dt_txt ? format(parseISO(d?.dt_txt ?? ""), "EEEE") : ""}
              temp = {d?.main.temp ?? 273.15}
              feels_like = {d?.main.feels_like ?? 273.15}
              temp_min = {d?.main.temp_min ?? 263.15}
              temp_max = {d?.main.temp_max ?? 283.15}
              description = {d?.weather[0].description ?? ""}
              visibility = {metersToKilometers(d?.visibility ?? 10000)}
              humidity = {`${d?.main.humidity}%`}
              windSpeed = {convertWindSpeed(d?.wind.speed ?? 10000)}
              airPressure = {`${d?.main.pressure} hPa`}
              sunrise = {undefined}
              sunset = {undefined}
            />
          ))}
        </section>
        </>
        )}
      </main>
    </div>
  )
}


function WeatherSkeleton() {
  return (
    <section className="space-y-8 ">
      {/* Today's data skeleton */}
      <div className="space-y-2 animate-pulse">
        {/* Date skeleton */}
        <div className="flex gap-1 text-2xl items-end ">
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
        </div>

        {/* Time wise temperature skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 7 days forecast skeleton */}
      <div className="flex flex-col gap-4 animate-pulse">
        <p className="text-2xl h-8 w-36 bg-gray-300 rounded"></p>

        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
}



