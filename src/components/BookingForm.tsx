"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, Mail, Phone, User, Shield, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";
import { useSearchParams } from "next/navigation";
import { readUtmFromSearch, saveUtmToStorage, getUtmFromStorage } from "@/lib/utm";

interface Room {
  id: string;
  name: string;
  base_price: number;
  max_guests: number;
  description: string;
}

export default function BookingForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    adults: "2",
    children: "0",
    roomId: "",
    specialRequests: "",
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [lastCreated, setLastCreated] = useState<{ reference: string; roomName?: string; total?: number; checkIn?: string; checkOut?: string } | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);
  const [nightsEstimate, setNightsEstimate] = useState<number>(0);
  const [trackedSteps, setTrackedSteps] = useState({ dates: false, room: false, contact: false });

  // Capture UTM from URL
  useEffect(() => {
    const utm = readUtmFromSearch(window.location.search);
    saveUtmToStorage(utm);
  }, []);

  // Charger les chambres au montage
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        if (response.ok) {
          const data = await response.json();
          const fetchedRooms = Array.isArray(data) ? data : (data?.rooms ?? []);
          setRooms(fetchedRooms);
          const roomIdParam = searchParams.get('roomId');
          const hasRoomParam = roomIdParam && fetchedRooms.some((r: any) => r.id === roomIdParam);
          const initialRoomId = hasRoomParam ? roomIdParam! : (fetchedRooms[0]?.id || "");
          setFormData(prev => ({ ...prev, roomId: initialRoomId }));
        } else {
          console.error('Failed to fetch rooms');
          toast.error("Erreur lors du chargement des chambres");
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error("Erreur lors du chargement des chambres");
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [searchParams]);

  // Pré-remplir depuis les paramètres d'URL
  useEffect(() => {
    const checkInParam = searchParams.get('checkIn') || "";
    const checkOutParam = searchParams.get('checkOut') || "";
    const adultsParam = searchParams.get('adults') || "2";

    setFormData(prev => ({
      ...prev,
      checkIn: checkInParam,
      checkOut: checkOutParam,
      adults: adultsParam,
    }));
  }, [searchParams]);

    useEffect(() => {
    if (formData.checkIn && formData.checkOut && !trackedSteps.dates) {
      trackEvent('booking_step_dates', { source: 'form' });
      setTrackedSteps((prev) => ({ ...prev, dates: true }));
    }
  }, [formData.checkIn, formData.checkOut, trackedSteps.dates]);

  useEffect(() => {
    if (formData.roomId && !trackedSteps.room) {
      trackEvent('booking_step_room', { source: 'form' });
      setTrackedSteps((prev) => ({ ...prev, room: true }));
    }
  }, [formData.roomId, trackedSteps.room]);

  useEffect(() => {
    if (formData.email && formData.firstName && !trackedSteps.contact) {
      trackEvent('booking_step_contact', { source: 'form' });
      setTrackedSteps((prev) => ({ ...prev, contact: true }));
    }
  }, [formData.email, formData.firstName, trackedSteps.contact]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotalAmount = () => {
    // Récupérer le prix de la chambre sélectionnée
    const selectedRoom = rooms.find(r => r.id === formData.roomId);
    if (!selectedRoom) return 0;

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    
    const pricePerNight = selectedRoom.base_price || 100;
    return Math.max(0, nights * pricePerNight);
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    return Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchPricing = async () => {
      if (!formData.roomId || !formData.checkIn || !formData.checkOut) {
        setPriceEstimate(null);
        setNightsEstimate(0);
        return;
      }

      try {
        const response = await fetch('/api/reservations/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room_id: formData.roomId,
            check_in: formData.checkIn,
            check_out: formData.checkOut,
            adults_count: parseInt(formData.adults),
            children_count: parseInt(formData.children),
          }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          setPriceEstimate(null);
          setNightsEstimate(0);
          return;
        }
        setPriceEstimate(Number(data.total_price ?? 0));
        setNightsEstimate(Number(data.nights ?? 0));
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setPriceEstimate(null);
          setNightsEstimate(0);
        }
      }
    };

    fetchPricing();
    return () => controller.abort();
  }, [formData.roomId, formData.checkIn, formData.checkOut, formData.adults, formData.children]);

  const handleSubmit = async (e: React.FormEvent) => {
    trackEvent('booking_submit', { source: 'form' });
    e.preventDefault();
    
    // Validation
    if (!formData.checkIn || !formData.checkOut) {
      toast.error("Veuillez sélectionner les dates d'arrivée et de départ");
      return;
    }

    if (!formData.roomId) {
      toast.error("Veuillez sélectionner une chambre");
      return;
    }

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    
    if (checkOut <= checkIn) {
      toast.error("La date de départ doit être après la date d'arrivée");
      return;
    }

    setIsLoading(true);

    try {
      // Vérification silencieuse de la disponibilité avant création
      const availRes = await fetch('/api/reservations/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: formData.roomId,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          adults_count: parseInt(formData.adults),
          children_count: parseInt(formData.children),
        })
      });
      const availData = await availRes.json();
      if (!availRes.ok || !availData.available) {
        toast.error(availData.error || availData.message || "Chambre indisponible pour ces dates");
        return;
      }

      const pricingRes = await fetch('/api/reservations/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: formData.roomId,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          adults_count: parseInt(formData.adults),
          children_count: parseInt(formData.children),
        }),
      })

      const pricingData = await pricingRes.json()
      if (!pricingRes.ok) {
        toast.error(pricingData.error || "Erreur lors du calcul du prix")
        return
      }

      const totalAmount = pricingData.total_price ?? calculateTotalAmount()
      
      const payload = {
        guest_name: `${formData.firstName} ${formData.lastName}`,
        guest_email: formData.email,
        guest_phone: formData.phone,
        guest_count: parseInt(formData.adults) + parseInt(formData.children),
        adults_count: parseInt(formData.adults),
        children_count: parseInt(formData.children),
        room_id: formData.roomId,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        total_amount: totalAmount,
        paid_amount: 0,
        status: "pending",
        special_requests: formData.specialRequests
      };

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erreur lors de la création de la réservation");
        console.error('Error:', data);
        return;
      }

      toast.success(`Réservation créée avec succès ! Référence: ${data.reference}`);
      setLastCreated({
        reference: data.reference,
        roomName: rooms.find(r => r.id === formData.roomId)?.name,
        total: totalAmount,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
      });
      
      // Réinitialiser le formulaire
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        checkIn: "",
        checkOut: "",
        adults: "2",
        children: "0",
        roomId: rooms.length > 0 ? rooms[0].id : "",
        specialRequests: "",
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error("Erreur lors de la création de la réservation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-8 text-white">
        <h3 className="text-2xl font-serif font-bold mb-2">Formulaire de Réservation</h3>
        <p>Réservez directement et bénéficiez du meilleur tarif</p>
      </div>

      {/* Messages de statut basés sur l'URL */}
      <div className="px-8 pt-6">
        {(() => {
          const status = searchParams.get('status')
          const checkInQ = searchParams.get('checkIn')
          const checkOutQ = searchParams.get('checkOut')
          const roomIdQ = searchParams.get('roomId')
          const hasPrefill = !!(checkInQ && checkOutQ && roomIdQ)

          if (status === 'unavailable') {
            return (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                La chambre n'est pas disponible pour ces dates. Veuillez choisir d'autres dates ou une autre chambre.
              </div>
            )
          }

          if (status === 'available' && hasPrefill) {
            return (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3">
                Chambre disponible pour ces dates. Formulaire prérempli.
              </div>
            )
          }

          if (status === 'available' && !hasPrefill) {
            return (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 px-4 py-3">
                Formulaire incomplet. Veuillez compléter vos informations pour confirmer.
              </div>
            )
          }

          return null
        })()}
      </div>

      {/* Confirmation après création */}
      {lastCreated && (
        <div className="px-8">
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3">
            Réservation confirmée. Référence: <strong>{lastCreated.reference}</strong>.
            {lastCreated.roomName && (
              <span className="ml-2">Chambre: {lastCreated.roomName}</span>
            )}
            {lastCreated.checkIn && lastCreated.checkOut && (
              <span className="ml-2">Séjour: {lastCreated.checkIn} → {lastCreated.checkOut}</span>
            )}
            {typeof lastCreated.total === 'number' && (
              <span className="ml-2">Total estimé: {lastCreated.total} MAD</span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Prénom
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Votre prénom"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Nom
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Votre nom"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail size={16} className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone size={16} className="inline mr-2" />
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="+212 6 XX XX XX XX"
            />
          </div>
        </div>

        {/* Dates et chambre */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Arrivée
            </label>
            <input
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Départ
            </label>
            <input
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chambre
            </label>
            {isLoadingRooms ? (
              <div className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                <Loader size={16} className="animate-spin mr-2" />
                <span className="text-sm">Chargement...</span>
              </div>
            ) : (
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Sélectionner une chambre</option>
                {(rooms || []).map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} - {room.base_price} MAD/nuit
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users size={16} className="inline mr-2" />
              Adultes
            </label>
            <select
              name="adults"
              value={formData.adults}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {[1,2,3,4].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'adulte' : 'adultes'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enfants
            </label>
            <select
              name="children"
              value={formData.children}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {[0,1,2,3].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'enfant' : 'enfants'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Demandes spéciales */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Demandes spéciales
          </label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Allergies, anniversaire, préférences alimentaires..."
          />
        </div>

        {/* Bouton de soumission */}
        <div className="pt-4">
          {/* Résumé du prix */}
          <div className="mb-4 flex items-center justify-between text-sm text-gray-700">
            <span>
              {(nightsEstimate || calculateNights())} nuit{(nightsEstimate || calculateNights()) > 1 ? 's' : ''}
            </span>
            <span className="font-semibold">
              Total estimé: {priceEstimate ?? calculateTotalAmount()} MAD
            </span>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg hover:shadow-xl font-bold text-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader size={20} className="animate-spin" />
                <span>Création en cours...</span>
              </>
            ) : (
              <>
                <Shield size={20} />
                <span>Confirmer la réservation</span>
              </>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          <Shield size={16} className="inline mr-1" />
          Réservation sécurisée • Paiement optionnel
        </p>
      </form>
    </div>
  );
}
