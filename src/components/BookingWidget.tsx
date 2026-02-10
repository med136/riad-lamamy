"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, Search, ChevronDown, Check, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { readUtmFromSearch, saveUtmToStorage, getUtmFromStorage, appendUtmToSearchParams } from "@/lib/utm";
import { trackEvent } from "@/lib/analytics";

interface Room {
  id: string;
  name: string;
  base_price: number;
  max_guests: number;
}

export function BookingWidget() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState({ adults: 2, children: 0, infants: 0 });
  const [roomId, setRoomId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);
  const [nightsEstimate, setNightsEstimate] = useState<number>(0);
  const [trackedSteps, setTrackedSteps] = useState({ dates: false, room: false, guests: false, promo: false });

  // Capture UTM from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const utm = readUtmFromSearch(window.location.search);
      saveUtmToStorage(utm);
    }
  }, []);

  // Charger les chambres dynamiquement
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
          const data = await res.json();
          const fetchedRooms = Array.isArray(data) ? data : (data?.rooms ?? []);
          setRooms(fetchedRooms);
          if (fetchedRooms.length > 0) {
            setRoomId(fetchedRooms[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        setIsLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

    useEffect(() => {
    if (checkIn && checkOut && !trackedSteps.dates) {
      trackEvent('booking_step_dates', { source: 'widget' });
      setTrackedSteps((prev) => ({ ...prev, dates: true }));
    }
  }, [checkIn, checkOut, trackedSteps.dates]);

  useEffect(() => {
    if (roomId && !trackedSteps.room) {
      trackEvent('booking_step_room', { source: 'widget' });
      setTrackedSteps((prev) => ({ ...prev, room: true }));
    }
  }, [roomId, trackedSteps.room]);

  useEffect(() => {
    if ((guests.adults > 0 || guests.children > 0) && !trackedSteps.guests) {
      trackEvent('booking_step_guests', { source: 'widget' });
      setTrackedSteps((prev) => ({ ...prev, guests: true }));
    }
  }, [guests, trackedSteps.guests]);

  useEffect(() => {
    if (promoCode && promoCode === 'RIAD10' && !trackedSteps.promo) {
      trackEvent('promo_applied', { source: 'widget' });
      setTrackedSteps((prev) => ({ ...prev, promo: true }));
    }
  }, [promoCode, trackedSteps.promo]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const room = rooms.find(r => r.id === roomId);
    if (!room || nights === 0) return 0;
    
    let total = room.base_price * nights;
    
    // Réduction pour séjour long
    if (nights >= 7) total *= 0.9; // 10% de réduction
    
    // Application code promo
    if (promoCode === "RIAD10") total *= 0.9;
    
    return Math.round(total);
  };

  const getDisplayedTotal = () => {
    const baseTotal = priceEstimate ?? calculateTotal();
    const nights = nightsEstimate || calculateNights();
    if (baseTotal === 0 || nights === 0) return baseTotal;

    let total = baseTotal;
    if (nights >= 7) total *= 0.9;
    if (promoCode === "RIAD10") total *= 0.9;
    return Math.round(total);
  };

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut) {
      setPriceEstimate(null);
      setNightsEstimate(0);
      return;
    }

    const controller = new AbortController();
    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/reservations/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room_id: roomId,
            check_in: checkIn.toISOString().split('T')[0],
            check_out: checkOut.toISOString().split('T')[0],
            adults_count: guests.adults,
            children_count: guests.children,
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setPriceEstimate(null);
          setNightsEstimate(0);
          return;
        }
        setPriceEstimate(Number(data.total_price ?? 0));
        setNightsEstimate(Number(data.nights ?? 0));
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setPriceEstimate(null);
          setNightsEstimate(0);
        }
      }
    };

    fetchPricing();
    return () => controller.abort();
  }, [roomId, checkIn, checkOut, guests.adults, guests.children]);

  const handleSubmit = async (e: React.FormEvent) => {
    trackEvent('booking_check', { source: 'widget' });
    e.preventDefault();
    if (!checkIn || !checkOut || !roomId) {
      toast.error("Veuillez sélectionner les dates et la chambre");
      return;
    }

    const check_in = checkIn.toISOString().split('T')[0];
    const check_out = checkOut.toISOString().split('T')[0];

    try {
      setIsChecking(true);
      const res = await fetch('/api/reservations/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          check_in,
          check_out,
          adults_count: guests.adults,
          children_count: guests.children,
          guest_count: guests.adults + guests.children + guests.infants,
        })
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Vérification indisponible');
        return;
      }

      if (data.available) {
        const params = new URLSearchParams({
          checkIn: check_in,
          checkOut: check_out,
          roomId: roomId,
          adults: guests.adults.toString(),
          status: 'available',
        });
        toast.success('Chambre disponible, formulaire prérempli');
        const utm = getUtmFromStorage();
        appendUtmToSearchParams(params, utm);
        router.push(`/reservations?${params.toString()}`);
      } else {
        const params = new URLSearchParams({
          checkIn: check_in,
          checkOut: check_out,
          roomId: roomId,
          adults: guests.adults.toString(),
          status: 'unavailable',
        });
        toast.error('Désolé, la chambre n\'est pas disponible pour ces dates');
        const utm = getUtmFromStorage();
        appendUtmToSearchParams(params, utm);
        router.push(`/reservations?${params.toString()}`);
      }
    } catch (err) {
      console.error('Availability check failed:', err);
      toast.error('Erreur lors de la vérification');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 -mt-20 relative z-20">
      <div className="lux-panel rounded-3xl p-6 md:p-8 max-w-6xl mx-auto border border-amber-200/40">
        <div className="text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            Réservez votre séjour
          </h3>
          <p className="text-gray-600">
            Meilleur prix garanti • Annulation gratuite • Petit-déjeuner inclus
          </p>
        </div>
        
        <form className="space-y-6">
          {/* Dates et personnes */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Arrivée */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <Calendar size={16} className="inline mr-2" />
                Arrivée
              </label>
              <div className="relative">
                <DatePicker
                  selected={checkIn}
                  onChange={setCheckIn}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholderText="Date d'arrivée"
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                />
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Départ */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <Calendar size={16} className="inline mr-2" />
                Départ
              </label>
              <div className="relative">
                <DatePicker
                  selected={checkOut}
                  onChange={setCheckOut}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholderText="Date de départ"
                  dateFormat="dd/MM/yyyy"
                  minDate={checkIn || new Date()}
                />
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Personnes */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <Users size={16} className="inline mr-2" />
                Voyageurs
              </label>
              <div className="relative">
                <select
                  value={guests.adults}
                  onChange={(e) => setGuests({...guests, adults: parseInt(e.target.value)})}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none"
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'adulte' : 'adultes'}</option>
                  ))}
                </select>
                <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Type de chambre */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Chambre
              </label>
              {isLoadingRooms ? (
                <div className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Loader size={16} className="animate-spin mr-2" />
                  <span className="text-sm">Chargement...</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Sélectionner</option>
                    {rooms.map(room => (
                      <option key={room.id} value={String(room.id)}>
                        {room.name} - {room.base_price} MAD/nuit
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code promo */}
            <div>
              <button
                type="button"
                onClick={() => setShowPromo(!showPromo)}
                className="text-amber-600 hover:text-amber-700 text-sm font-semibold flex items-center"
              >
                <span>Code promo ?</span>
                <ChevronDown size={16} className={`ml-1 transition-transform ${showPromo ? "rotate-180" : ""}`} />
              </button>
              
              {showPromo && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Entrez votre code"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  {promoCode === "RIAD10" && (
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <Check size={16} className="mr-1" />
                      Code valide ! 10% de réduction appliqué
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Résumé du prix */}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">
                {(nightsEstimate || calculateNights())} nuit{(nightsEstimate || calculateNights()) > 1 ? 's' : ''} - {getDisplayedTotal()} MAD
              </div>
              <div className="text-sm text-gray-600">
                Taxes et frais inclus
              </div>
            </div>
          </div>

          {/* Bouton de recherche */}
          <div className="text-center">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!checkIn || !checkOut || !roomId || isChecking}
              aria-busy={isChecking}
              className="group relative mx-auto inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-[#1b110c] px-10 py-4 text-base font-semibold text-white shadow-[0_22px_70px_-38px_rgba(0,0,0,0.78)] ring-1 ring-white/10 transition-colors hover:bg-[#22140e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-[#1b110c] sm:w-auto sm:px-12 sm:text-lg"
            >
              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="absolute -inset-24 bg-[radial-gradient(circle_at_30%_40%,rgba(255,243,199,0.22),transparent_55%)]" />
              </span>
              {isChecking ? <Loader size={20} className="animate-spin" /> : <Search size={20} />}
              <span className="font-semibold text-lg">Vérifier la disponibilité</span>
              <span className="opacity-70 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                →
              </span>
            </button>
          </div>
        </form>

        {/* Avantages */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-amber-600 font-bold">✓</div>
              <div className="text-sm text-gray-600">Meilleur prix garanti</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-amber-600 font-bold">✓</div>
              <div className="text-sm text-gray-600">Annulation gratuite</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-amber-600 font-bold">✓</div>
              <div className="text-sm text-gray-600">Sans frais cachés</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-amber-600 font-bold">24/7</div>
              <div className="text-sm text-gray-600">Support client</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
