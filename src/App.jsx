import { createSignal, onMount, createEffect, Show, For } from 'solid-js';
import { supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [loading, setLoading] = createSignal(false);
  const [pickupLocation, setPickupLocation] = createSignal('');
  const [destination, setDestination] = createSignal('');
  const [rideOptions, setRideOptions] = createSignal([]);
  const [selectedRide, setSelectedRide] = createSignal(null);
  const [rideConfirmed, setRideConfirmed] = createSignal(false);

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      setCurrentPage('homePage')
    }
  }

  onMount(checkUserSignedIn)

  createEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user)
        setCurrentPage('homePage')
      } else {
        setUser(null)
        setCurrentPage('login')
      }
    })

    return () => {
      authListener.unsubscribe()
    }
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const handleRequestRide = async () => {
    setLoading(true);
    // Simulate API call to fetch ride options
    setTimeout(() => {
      setRideOptions([
        { id: 1, type: 'Economy', fare: 10 },
        { id: 2, type: 'Premium', fare: 15 },
        { id: 3, type: 'Luxury', fare: 25 },
      ]);
      setLoading(false);
    }, 1000);
  };

  const handleConfirmRide = async () => {
    if (!selectedRide()) return;
    setLoading(true);
    // Simulate API call to confirm ride
    setTimeout(() => {
      setRideConfirmed(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-gray-800">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-purple-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                view="magic_link"
                showLinks={false}
                authView="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="max-w-4xl mx-auto h-full flex flex-col">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-purple-600">رحلتك معنا</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <Show when={!rideConfirmed()}>
            <div class="flex flex-col flex-grow">
              <h2 class="text-2xl font-bold mb-4 text-purple-600">Request a Ride</h2>
              <div class="space-y-4">
                <input
                  type="text"
                  placeholder="Pickup Location"
                  value={pickupLocation()}
                  onInput={(e) => setPickupLocation(e.target.value)}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
                />
                <input
                  type="text"
                  placeholder="Destination"
                  value={destination()}
                  onInput={(e) => setDestination(e.target.value)}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
                />
                <button
                  class={`px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleRequestRide}
                  disabled={loading()}
                >
                  <Show when={loading()}>
                    Loading...
                  </Show>
                  <Show when={!loading()}>
                    Search for Rides
                  </Show>
                </button>
              </div>

              <Show when={rideOptions().length > 0}>
                <div class="mt-6">
                  <h3 class="text-xl font-bold mb-2 text-purple-600">Available Ride Options</h3>
                  <div class="space-y-4">
                    <For each={rideOptions()}>
                      {(ride) => (
                        <div
                          class={`p-4 border ${selectedRide() && selectedRide().id === ride.id ? 'border-purple-500' : 'border-gray-300'} rounded-lg flex justify-between items-center cursor-pointer`}
                          onClick={() => setSelectedRide(ride)}
                        >
                          <span class="font-semibold">{ride.type}</span>
                          <span>${ride.fare}</span>
                        </div>
                      )}
                    </For>
                  </div>
                  <button
                    class={`mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${!selectedRide() || loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleConfirmRide}
                    disabled={!selectedRide() || loading()}
                  >
                    <Show when={loading()}>
                      Confirming...
                    </Show>
                    <Show when={!loading()}>
                      Confirm Ride
                    </Show>
                  </button>
                </div>
              </Show>
            </div>
          </Show>

          <Show when={rideConfirmed()}>
            <div class="flex flex-col flex-grow justify-center items-center">
              <h2 class="text-3xl font-bold mb-4 text-purple-600">Ride Confirmed!</h2>
              <p class="text-lg text-gray-700 mb-6">Your driver is on the way.</p>
              <button
                class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                onClick={() => {
                  setRideConfirmed(false);
                  setPickupLocation('');
                  setDestination('');
                  setRideOptions([]);
                  setSelectedRide(null);
                }}
              >
                Request Another Ride
              </button>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}

export default App;