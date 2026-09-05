"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Loader,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

import { trackEvent } from "@/lib/analytics";
import {
  getUtmFromStorage,
  readUtmFromSearch,
  saveUtmToStorage,
} from "@/lib/utm";

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

  const [lastCreated, setLastCreated] = useState<{
    reference: string;
    roomName?: string;
    total?: number;
    checkIn?: string;
    checkOut?: string;
  } | null>(null);

  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);
  const [nightsEstimate, setNightsEstimate] = useState(0);

  const [trackedSteps, setTrackedSteps] = useState({
    dates: false,
    room: false,
    contact: false,
  });

  /* =========================================================
     UTM
     ========================================================= */

  useEffect(() => {
    const utm = readUtmFromSearch(window.location.search);
    saveUtmToStorage(utm);
  }, []);

  /* =========================================================
     LOAD ROOMS
     ========================================================= */

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/rooms");

        if (response.ok) {
          const data = await response.json();

          const fetchedRooms: Room[] = Array.isArray(data)
            ? data
            : data?.rooms ?? [];

          setRooms(fetchedRooms);

          const roomIdParam = searchParams.get("roomId");

          const hasRoomParam =
            roomIdParam &&
            fetchedRooms.some((room) => room.id === roomIdParam);

          const initialRoomId = hasRoomParam
            ? roomIdParam
            : fetchedRooms[0]?.id || "";

          setFormData((prev) => ({
            ...prev,
            roomId: initialRoomId,
          }));
        } else {
          console.error("Failed to fetch rooms");

          toast.error(
            "Erreur lors du chargement des chambres",
          );
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);

        toast.error(
          "Erreur lors du chargement des chambres",
        );
      } finally {
        setIsLoadingRooms(false);
      }
    };

    void fetchRooms();
  }, [searchParams]);

  /* =========================================================
     URL PREFILL
     ========================================================= */

  useEffect(() => {
    const checkInParam =
      searchParams.get("checkIn") || "";

    const checkOutParam =
      searchParams.get("checkOut") || "";

    const adultsParam =
      searchParams.get("adults") || "2";

    setFormData((prev) => ({
      ...prev,
      checkIn: checkInParam,
      checkOut: checkOutParam,
      adults: adultsParam,
    }));
  }, [searchParams]);

  /* =========================================================
     ANALYTICS
     ========================================================= */

  useEffect(() => {
    if (
      formData.checkIn &&
      formData.checkOut &&
      !trackedSteps.dates
    ) {
      trackEvent("booking_step_dates", {
        source: "form",
      });

      setTrackedSteps((prev) => ({
        ...prev,
        dates: true,
      }));
    }
  }, [
    formData.checkIn,
    formData.checkOut,
    trackedSteps.dates,
  ]);

  useEffect(() => {
    if (
      formData.roomId &&
      !trackedSteps.room
    ) {
      trackEvent("booking_step_room", {
        source: "form",
      });

      setTrackedSteps((prev) => ({
        ...prev,
        room: true,
      }));
    }
  }, [formData.roomId, trackedSteps.room]);

  useEffect(() => {
    if (
      formData.email &&
      formData.firstName &&
      !trackedSteps.contact
    ) {
      trackEvent("booking_step_contact", {
        source: "form",
      });

      setTrackedSteps((prev) => ({
        ...prev,
        contact: true,
      }));
    }
  }, [
    formData.email,
    formData.firstName,
    trackedSteps.contact,
  ]);

  /* =========================================================
     FORM CHANGE
     ========================================================= */

  const handleChange = (
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  /* =========================================================
     PRICE HELPERS
     ========================================================= */

  const calculateTotalAmount = () => {
    const selectedRoom = rooms.find(
      (room) => room.id === formData.roomId,
    );

    if (!selectedRoom) {
      return 0;
    }

    if (!formData.checkIn || !formData.checkOut) {
      return 0;
    }

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) /
        (1000 * 3600 * 24),
    );

    const pricePerNight =
      selectedRoom.base_price || 100;

    return Math.max(
      0,
      nights * pricePerNight,
    );
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) {
      return 0;
    }

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);

    return Math.max(
      0,
      Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) /
          (1000 * 3600 * 24),
      ),
    );
  };

  /* =========================================================
     PRICING
     ========================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const fetchPricing = async () => {
      if (
        !formData.roomId ||
        !formData.checkIn ||
        !formData.checkOut
      ) {
        setPriceEstimate(null);
        setNightsEstimate(0);
        return;
      }

      try {
        const response = await fetch(
          "/api/reservations/pricing",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              room_id: formData.roomId,
              check_in: formData.checkIn,
              check_out: formData.checkOut,
              adults_count: parseInt(formData.adults),
              children_count: parseInt(
                formData.children,
              ),
            }),
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setPriceEstimate(null);
          setNightsEstimate(0);
          return;
        }

        setPriceEstimate(
          Number(data.total_price ?? 0),
        );

        setNightsEstimate(
          Number(data.nights ?? 0),
        );
      } catch (error) {
        if (
          (error as Error).name !== "AbortError"
        ) {
          setPriceEstimate(null);
          setNightsEstimate(0);
        }
      }
    };

    void fetchPricing();

    return () => controller.abort();
  }, [
    formData.roomId,
    formData.checkIn,
    formData.checkOut,
    formData.adults,
    formData.children,
  ]);

  /* =========================================================
     SUBMIT
     ========================================================= */

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    trackEvent("booking_submit", {
      source: "form",
    });

    if (
      !formData.checkIn ||
      !formData.checkOut
    ) {
      toast.error(
        "Veuillez sélectionner les dates d'arrivée et de départ",
      );
      return;
    }

    if (!formData.roomId) {
      toast.error(
        "Veuillez sélectionner une chambre",
      );
      return;
    }

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);

    if (checkOut <= checkIn) {
      toast.error(
        "La date de départ doit être après la date d'arrivée",
      );
      return;
    }

    setIsLoading(true);

    try {
      /* Availability */

      const availRes = await fetch(
        "/api/reservations/availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_id: formData.roomId,
            check_in: formData.checkIn,
            check_out: formData.checkOut,
            adults_count: parseInt(
              formData.adults,
            ),
            children_count: parseInt(
              formData.children,
            ),
          }),
        },
      );

      const availData = await availRes.json();

      if (
        !availRes.ok ||
        !availData.available
      ) {
        toast.error(
          availData.error ||
            availData.message ||
            "Chambre indisponible pour ces dates",
        );
        return;
      }

      /* Pricing */

      const pricingRes = await fetch(
        "/api/reservations/pricing",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_id: formData.roomId,
            check_in: formData.checkIn,
            check_out: formData.checkOut,
            adults_count: parseInt(
              formData.adults,
            ),
            children_count: parseInt(
              formData.children,
            ),
          }),
        },
      );

      const pricingData =
        await pricingRes.json();

      if (!pricingRes.ok) {
        toast.error(
          pricingData.error ||
            "Erreur lors du calcul du prix",
        );
        return;
      }

      const totalAmount =
        pricingData.total_price ??
        calculateTotalAmount();

      const payload = {
        guest_name: `${formData.firstName} ${formData.lastName}`,
        guest_email: formData.email,
        guest_phone: formData.phone,

        guest_count:
          parseInt(formData.adults) +
          parseInt(formData.children),

        adults_count: parseInt(
          formData.adults,
        ),

        children_count: parseInt(
          formData.children,
        ),

        room_id: formData.roomId,
        check_in: formData.checkIn,
        check_out: formData.checkOut,

        total_amount: totalAmount,
        paid_amount: 0,

        status: "pending",

        special_requests:
          formData.specialRequests,

        utm: getUtmFromStorage(),
      };

      /* Create reservation */

      const response = await fetch(
        "/api/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.error ||
            "Erreur lors de la création de la réservation",
        );

        console.error("Error:", data);

        return;
      }

      toast.success(
        `Réservation créée avec succès ! Référence: ${data.reference}`,
      );

      setLastCreated({
        reference: data.reference,

        roomName: rooms.find(
          (room) =>
            room.id === formData.roomId,
        )?.name,

        total: totalAmount,

        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        checkIn: "",
        checkOut: "",
        adults: "2",
        children: "0",

        roomId:
          rooms.length > 0
            ? rooms[0].id
            : "",

        specialRequests: "",
      });
    } catch (error) {
      console.error("Error:", error);

      toast.error(
        "Erreur lors de la création de la réservation",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const nights =
    nightsEstimate || calculateNights();

  const total =
    priceEstimate ??
    calculateTotalAmount();

  /* =========================================================
     DESIGN TOKENS
     ========================================================= */

  const fieldClass = `
    h-[58px]
    w-full
    rounded-[14px]
    border
    border-[#B28A47]/20
    bg-[#FFFDF8]
    px-4
    text-[15px]
    font-normal
    text-[#2B1C17]
    outline-none
    transition-all
    duration-200
    placeholder:text-[#6F625C]/50
    hover:border-[#B28A47]/40
    focus:border-[#0F5A46]/55
    focus:ring-2
    focus:ring-[#0F5A46]/10
  `;

  const labelClass = `
    mb-2
    block
    text-[10px]
    font-semibold
    uppercase
    tracking-[0.18em]
    text-[#6F625C]
  `;

  return (
    <div>
      {/* =====================================================
          STATUS FROM URL
          ===================================================== */}

      {(() => {
        const status =
          searchParams.get("status");

        const checkInQ =
          searchParams.get("checkIn");

        const checkOutQ =
          searchParams.get("checkOut");

        const roomIdQ =
          searchParams.get("roomId");

        const hasPrefill = Boolean(
          checkInQ &&
            checkOutQ &&
            roomIdQ,
        );

        if (status === "unavailable") {
          return (
            <div
              className="
                mb-7
                rounded-[16px]
                border
                border-red-200
                bg-red-50/80
                px-5
                py-4
                text-sm
                leading-6
                text-red-700
              "
            >
              La chambre n&apos;est pas
              disponible pour ces dates.
              Veuillez sélectionner
              d&apos;autres dates ou une
              autre chambre.
            </div>
          );
        }

        if (
          status === "available" &&
          hasPrefill
        ) {
          return (
            <div
              className="
                mb-7
                flex
                items-start
                gap-3
                rounded-[16px]
                border
                border-[#0F5A46]/15
                bg-[#0F5A46]/5
                px-5
                py-4
                text-sm
                leading-6
                text-[#0F5A46]
              "
            >
              <Check
                className="mt-1 h-4 w-4 shrink-0"
                strokeWidth={1.8}
              />

              <span>
                La chambre est disponible.
                Vos informations de séjour
                ont été préremplies.
              </span>
            </div>
          );
        }

        if (
          status === "available" &&
          !hasPrefill
        ) {
          return (
            <div
              className="
                mb-7
                rounded-[16px]
                border
                border-[#B28A47]/25
                bg-[#B28A47]/5
                px-5
                py-4
                text-sm
                leading-6
                text-[#6F5629]
              "
            >
              Complétez les informations
              ci-dessous pour poursuivre
              votre réservation.
            </div>
          );
        }

        return null;
      })()}

      {/* =====================================================
          SUCCESS
          ===================================================== */}

      {lastCreated && (
        <div
          className="
            mb-8
            rounded-[18px]
            border
            border-[#0F5A46]/15
            bg-[#0F5A46]/5
            p-5
            sm:p-6
          "
        >
          <div className="flex gap-4">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#0F5A46]
                text-[#FFFDF8]
              "
            >
              <Check
                className="h-4 w-4"
                strokeWidth={2}
              />
            </div>

            <div>
              <h3
                className="
                  font-serif
                  text-[25px]
                  font-medium
                  leading-tight
                  text-[#2B1C17]
                "
              >
                Votre demande est
                enregistrée
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-[#5D514C]
                "
              >
                Référence{" "}
                <strong>
                  {lastCreated.reference}
                </strong>
              </p>

              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  gap-x-5
                  gap-y-1
                  text-[13px]
                  text-[#6F625C]
                "
              >
                {lastCreated.roomName && (
                  <span>
                    {lastCreated.roomName}
                  </span>
                )}

                {lastCreated.checkIn &&
                  lastCreated.checkOut && (
                    <span>
                      {lastCreated.checkIn}
                      {" → "}
                      {lastCreated.checkOut}
                    </span>
                  )}

                {typeof lastCreated.total ===
                  "number" && (
                  <span>
                    {lastCreated.total} MAD
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* ===================================================
            STEP 01
            =================================================== */}

        <section>
          <StepHeader
            number="01"
            label="Étape 01"
            title="Votre séjour"
            description="Choisissez vos dates, votre chambre et le nombre de voyageurs."
          />

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {/* CHECK IN */}

            <div>
              <label
                htmlFor="checkIn"
                className={labelClass}
              >
                Arrivée
              </label>

              <input
                id="checkIn"
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                required
                className={fieldClass}
              />
            </div>

            {/* CHECK OUT */}

            <div>
              <label
                htmlFor="checkOut"
                className={labelClass}
              >
                Départ
              </label>

              <input
                id="checkOut"
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                required
                className={fieldClass}
              />
            </div>

            {/* ROOM */}

            <div className="md:col-span-2 xl:col-span-1">
              <label
                htmlFor="roomId"
                className={labelClass}
              >
                Chambre
              </label>

              {isLoadingRooms ? (
                <div
                  className={`
                    ${fieldClass}
                    flex
                    items-center
                    gap-2
                    text-[#6F625C]
                  `}
                >
                  <Loader
                    size={16}
                    className="animate-spin"
                  />

                  Chargement...
                </div>
              ) : (
                <select
                  id="roomId"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                >
                  <option value="">
                    Sélectionner une chambre
                  </option>

                  {rooms.map((room) => (
                    <option
                      key={room.id}
                      value={room.id}
                    >
                      {room.name} —{" "}
                      {room.base_price} MAD /
                      nuit
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* GUESTS */}

          <div
            className="
              mt-4
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >
            <div>
              <label
                htmlFor="adults"
                className={labelClass}
              >
                Adultes
              </label>

              <select
                id="adults"
                name="adults"
                value={formData.adults}
                onChange={handleChange}
                className={fieldClass}
              >
                {[1, 2, 3, 4].map(
                  (num) => (
                    <option
                      key={num}
                      value={num}
                    >
                      {num}{" "}
                      {num === 1
                        ? "adulte"
                        : "adultes"}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="children"
                className={labelClass}
              >
                Enfants
              </label>

              <select
                id="children"
                name="children"
                value={formData.children}
                onChange={handleChange}
                className={fieldClass}
              >
                {[0, 1, 2, 3].map(
                  (num) => (
                    <option
                      key={num}
                      value={num}
                    >
                      {num}{" "}
                      {num === 1
                        ? "enfant"
                        : "enfants"}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </section>

        {/* ===================================================
            PREMIUM SEPARATOR
            =================================================== */}

        <div
          className="
            my-3
            flex
            items-center
            gap-4
          "
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-[#B28A47]/15" />

          <span
            className="
              h-1.5
              w-1.5
              rotate-45
              bg-[#B28A47]/60
            "
          />

          <span className="h-px flex-1 bg-[#B28A47]/15" />
        </div>

        {/* ===================================================
            STEP 02
            =================================================== */}

        <section>
          <StepHeader
            number="02"
            label="Étape 02"
            title="Vos coordonnées"
            description="Indiquez vos informations afin que nous puissions confirmer et préparer votre séjour."
          />

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >
            {/* FIRST NAME */}

            <div>
              <label
                htmlFor="firstName"
                className={labelClass}
              >
                Prénom
              </label>

              <div className="relative">
                <UserRound
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#B28A47]
                  "
                  strokeWidth={1.5}
                />

                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                  className={`${fieldClass} pl-11`}
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            {/* LAST NAME */}

            <div>
              <label
                htmlFor="lastName"
                className={labelClass}
              >
                Nom
              </label>

              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
                className={fieldClass}
                placeholder="Votre nom"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                className={labelClass}
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#B28A47]
                  "
                  strokeWidth={1.5}
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={`${fieldClass} pl-11`}
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* PHONE */}

            <div>
              <label
                htmlFor="phone"
                className={labelClass}
              >
                Téléphone
              </label>

              <div className="relative">
                <Phone
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#B28A47]
                  "
                  strokeWidth={1.5}
                />

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                  className={`${fieldClass} pl-11`}
                  placeholder="+212 6 XX XX XX XX"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            SPECIAL REQUESTS
            =================================================== */}

        <div
          className="
            my-3
            flex
            items-center
            gap-4
          "
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-[#B28A47]/15" />

          <span
            className="
              h-1.5
              w-1.5
              rotate-45
              bg-[#B28A47]/60
            "
          />

          <span className="h-px flex-1 bg-[#B28A47]/15" />
        </div>

        <section>
          <div className="mb-4">
            <h3
              className="
                font-serif
                text-[25px]
                font-medium
                text-[#2B1C17]
              "
            >
              Un détail à nous signaler ?
            </h3>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-[#6F625C]
              "
            >
              Cette partie est
              facultative.
            </p>
          </div>

          <label
            htmlFor="specialRequests"
            className={labelClass}
          >
            Demandes particulières
          </label>

          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows={4}
            className="
              w-full
              resize-none
              rounded-[14px]
              border
              border-[#B28A47]/20
              bg-[#FFFDF8]
              px-4
              py-4
              text-[15px]
              leading-6
              text-[#2B1C17]
              outline-none
              transition-all
              duration-200
              placeholder:text-[#6F625C]/50
              hover:border-[#B28A47]/40
              focus:border-[#0F5A46]/55
              focus:ring-2
              focus:ring-[#0F5A46]/10
            "
            placeholder="Allergies, anniversaire, préférences alimentaires ou toute autre information utile..."
          />

          <p
            className="
              mt-2
              text-[12px]
              leading-5
              text-[#6F625C]/70
            "
          >
            Nous ferons de notre mieux
            pour répondre à votre demande.
          </p>
        </section>

        {/* ===================================================
            PRICE + CTA
            =================================================== */}

        <section
          className="
            rounded-[20px]
            border
            border-[#B28A47]/15
            bg-[#F8F5EF]/75
            p-5
            sm:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            {/* PRICE */}

            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-[#B28A47]
                "
              >
                Estimation du séjour
              </p>

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  items-baseline
                  gap-x-3
                  gap-y-1
                "
              >
                <span
                  className="
                    font-serif
                    text-[32px]
                    font-medium
                    leading-none
                    text-[#2B1C17]
                  "
                >
                  {total} MAD
                </span>

                <span
                  className="
                    text-sm
                    text-[#6F625C]
                  "
                >
                  {nights > 0 && (
                    <>
                      · {nights} nuit
                      {nights > 1 ? "s" : ""}
                    </>
                  )}
                </span>
              </div>

              <p
                className="
                  mt-2
                  text-[12px]
                  text-[#6F625C]/70
                "
              >
                Montant estimatif avant
                confirmation définitive.
              </p>
            </div>

            {/* CTA */}

            <button
              type="submit"
              disabled={isLoading}
              className="
                group
                inline-flex
                h-[54px]
                w-full
                items-center
                justify-center
                gap-3
                rounded-[14px]
                border
                border-[#B28A47]/35
                bg-[#0F5A46]
                px-7
                text-[14px]
                font-semibold
                text-[#FFFDF8]
                shadow-[0_12px_28px_-18px_rgba(15,90,70,0.55)]
                transition-all
                duration-200

                hover:-translate-y-px
                hover:bg-[#063F33]
                hover:shadow-[0_16px_34px_-18px_rgba(15,90,70,0.6)]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#B28A47]
                focus-visible:ring-offset-2

                disabled:cursor-not-allowed
                disabled:opacity-60
                disabled:hover:translate-y-0

                sm:w-auto
                sm:min-w-[245px]
              "
            >
              {isLoading ? (
                <>
                  <Loader
                    className="h-4 w-4 animate-spin"
                    strokeWidth={1.8}
                  />

                  Création en cours...
                </>
              ) : (
                <>
                  Confirmer la réservation

                  <ShieldCheck
                    className="
                      h-4
                      w-4
                      text-[#D2AA5A]
                    "
                    strokeWidth={1.7}
                  />
                </>
              )}
            </button>
          </div>
        </section>

        {/* ===================================================
            SECURITY
            =================================================== */}

        <div
          className="
            flex
            items-center
            justify-center
            gap-2
            px-2
            text-center
            text-[12px]
            leading-5
            text-[#6F625C]
          "
        >
          <ShieldCheck
            className="
              h-3.5
              w-3.5
              shrink-0
              text-[#0F5A46]
            "
            strokeWidth={1.7}
          />

          <span>
            Réservation sécurisée ·
            Vos informations restent
            confidentielles
          </span>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   STEP HEADER
   ============================================================ */

function StepHeader({
  number,
  label,
  title,
  description,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <div className="flex items-start gap-4">
        {/* NUMBER */}

        <div
          className="
            flex
            h-[46px]
            w-[46px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-[#B28A47]/40
            bg-[#F8F5EF]
            text-[13px]
            font-semibold
            tracking-[0.08em]
            text-[#0F5A46]
            shadow-[0_8px_18px_-16px_rgba(43,28,23,0.4)]
          "
          aria-hidden="true"
        >
          {number}
        </div>

        {/* TEXT */}

        <div className="min-w-0">
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[#B28A47]
            "
          >
            {label}
          </p>

          <h3
            className="
              mt-1
              font-serif
              text-[29px]
              font-medium
              leading-[1.05]
              text-[#2B1C17]
              sm:text-[31px]
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-2
              max-w-xl
              text-[13px]
              leading-6
              text-[#6F625C]
              sm:text-[14px]
            "
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}