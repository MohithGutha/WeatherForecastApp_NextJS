import {atom} from 'jotai';

// using jotai for fixing re-render issues when using (useContext + useState) for updating location state

export const locationAtom = atom('Pakala'); // using delhi as intial location state

export const loadingLocation = atom(false); // for loading state
