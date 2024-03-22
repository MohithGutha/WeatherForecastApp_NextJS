import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ClassValue } from 'clsx';


export function cn(...inputs: ClassValue[]){

    // tailwind-merge : to merge tailwind classes
    // clsx package : to pass conditional classes

    return twMerge(clsx(...inputs));
}