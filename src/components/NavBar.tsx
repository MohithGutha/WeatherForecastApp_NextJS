"use client"

import React, { useState } from 'react'
import { MdWbSunny } from "react-icons/md";
import { MdMyLocation } from "react-icons/md";
import { MdOutlineLocationOn } from "react-icons/md";
import SearchBox from '@/components/SearchBox';
import axios from 'axios'
import { useAtom } from 'jotai';
import { loadingLocation, locationAtom } from '@/utils/location';

type Props = {location? : string}

export default function NavBar(props : Props) {

    const API_KEY = process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY;

    const [city, setCity] = useState("");
    const [error, setError] = useState("");
    const [location, setLocation] = useAtom(locationAtom);
    const [_, setLoadingLocation] = useAtom(loadingLocation); // using '_', as the is no use of declaring it as we won't be using

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = async (value: string) => {

        setCity(value);

        if(value.length >= 3){
            // search for suggestions
            try{
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${API_KEY}`);
                
                const suggestions = response.data.list.map((item:any)=>item.name);
                // console.log(suggestions)
                setSuggestions(suggestions);
                setError("");
                setShowSuggestions(true);
            }
            catch(error){
                // console.log("Error : ", error)
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }
        else{
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }

    const handleSuggestionClick = (value: string) => {
        setCity(value);
        setShowSuggestions(false);
    }

    const handleSubmitSearch = (e: React.FormEvent<HTMLFormElement>) => {

        setLoadingLocation(true)
        e.preventDefault();

        if(suggestions.length==0){
            setError("Location not found");
            setLoadingLocation(false);
        }
        else{
            setError('');
            // Adding delay of 0.5 sec
            setTimeout(() => {
                setLoadingLocation(false);
                setLocation(city);
                setCity("");
                setShowSuggestions(false);
            }, 500) 
        }

    }

    function handleCurrentLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              setLoadingLocation(true);
              const {data} = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
              setTimeout(() => {
                setLoadingLocation(false);
                setLocation(data.name);
              }, 500);
            } 
            catch (error) {
              setLoadingLocation(false);
            }
          });
        }
    }




    return (
        <>
            <nav className=' shadow-sm sticky top-0 left-0 z-50 bg-white '>
                <div className=' h-[80px] w-full flex justify-between items-center max-w-7xl px-3 mx-auto '>
                    <div className=' flex items-center justify-center gap-2 '>
                        <h2 className=' text-gray-500 text-3xl '>Weather</h2>
                        <MdWbSunny className=' text-3xl mt-1 text-yellow-400 ' />
                    </div>
                    
                    {/*  */}
                    <section className=' flex gap-2 items-center ' >
                        <MdMyLocation 
                            title="Your Current Location"
                            onClick={handleCurrentLocation}
                            className='text-2xl text-gray-400 hover:opcaity-80 cursor-pointer ' 
                        />
                        <MdOutlineLocationOn className=' text-3xl  ' />
                        <p className=' text-slate-900/80 text-sm '> {props.location} </p>

                        {/* SearchBox hidden in mobile view */}
                        <div className='relative hidden md:flex'> 
                            {/* Search Box */}
                            <SearchBox 
                                value={city}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onSubmit={handleSubmitSearch}
                            />

                            {/* Suggestions Box */}
                            <SuggestionBox
                                {...{showSuggestions,
                                    suggestions,
                                    handleSuggestionClick,
                                    error
                                }}
                            />
                        </div>
                    </section>
                </div>
            </nav>
            
            <section className='flex max-w-7xl px-3 md:hidden '>
                <div className='relative'> 
                    {/* Search Box */}
                    <SearchBox 
                        value={city}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onSubmit={handleSubmitSearch}
                    />

                    {/* Suggestions Box */}
                    <SuggestionBox
                        {...{showSuggestions,
                            suggestions,
                            handleSuggestionClick,
                            error
                        }}
                    />
                </div>
            </section>
        </>
    )
}

function SuggestionBox({
    showSuggestions,
    suggestions,
    handleSuggestionClick,
    error
}:{
    showSuggestions: boolean,
    suggestions: string[],
    handleSuggestionClick: (item: string) => void,
    error: string
}){
    return (
        <>
            {( (showSuggestions && suggestions.length>1) || error ) && (
                <ul className='mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2'>
                    
                    {error && suggestions.length<1 && (
                        <li className='text-red-500 p-1'> {error} </li>
                    )}

                    {suggestions.map((item, i) => (
                        <li
                            key = {i}
                            onClick={() => handleSuggestionClick(item)}
                            className='cursor-pointer p-1 rounded hover:bg-gray-200'
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}