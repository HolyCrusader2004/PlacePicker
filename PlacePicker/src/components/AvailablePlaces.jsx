import { useEffect, useState } from 'react';
import Places from './Places.jsx';
import Error from './Error.jsx';
import {sortPlacesByDistance} from '../loc.js'

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([])
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    setIsFetching(true);
    
    async function fetchPlaces() {
      try{
        const response = await fetch('http://localhost:3000/places');
        const resData = await response.json();
      if(!response.ok){
        const error = new Error('failed to fetch places')
        throw error
      }

      navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(resData.places, position.coords.latitude, position.coords.longitude)
          setAvailablePlaces(sortedPlaces)
          setIsFetching(false)
      });

      }catch(error){
        setError({
          message: error.message || 'could not fetch items'
        })
        setIsFetching(false)
      }
    }
   fetchPlaces();
  }, [])

  if(error){
    return <Error title='An error occured' message={error.message}/>
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      loadingText = 'Fetching data...'
      isLoading={isFetching}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
