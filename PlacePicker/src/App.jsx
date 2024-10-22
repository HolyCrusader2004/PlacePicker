import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import Error from './components/Error.jsx';

async function updateUserSpaces(places) {
  const response = await fetch('http://localhost:3000/user-places',{
    method: 'PUT',
    body: JSON.stringify({places:places}),
    headers:{
      'Content-Type': 'application/json'
    }
  })
  const resData = await response.json();
  if(!response.ok){
    throw new Error('Failed to update user data')
  }
  return resData.message;
}

async function fetchUserSpaces() {
  const response = await fetch('http://localhost:3000/user-places')
  const resData = await response.json();
  if(!response.ok){
    throw new Error('Failed to update user data')
  }

  return resData.places;
}

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    setIsFetching(true);
    async function helperFunction(){
      try{
      const places = await fetchUserSpaces();
      setUserPlaces(places);
      }catch(error){
        setError({message: error.message || 'An error occured while fetching'})

      }
    }
    helperFunction()
    setIsFetching(false)
  },[])

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];

    })
    try{
      await updateUserSpaces([selectedPlace, ...userPlaces])
    }catch(error){
      setUserPlaces(userPlaces)
    }
    }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );
    try{
      await updateUserSpaces(
        userPlaces.filter((place) => place.id !== selectedPlace.current.id)
      )
    }catch(error){
      setUserPlaces(userPlaces)
    }
    setModalIsOpen(false);
  }, [userPlaces]);

  return (  <>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occured" message={error.message}/>}
        {!error &&     
        <Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          loadingText="Fetching your places..."
          isLoading={isFetching}
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
