"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Loader,
  Minus,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

import {
  appendUtmToSearchParams,
  getUtmFromStorage,
  readUtmFromSearch,
  saveUtmToStorage,
} from "@/lib/utm";

import { trackEvent } from "@/lib/analytics";

interface Room {
  id: string;
  name: string;
  base_price: number;
  max_guests: number;
}

type Guests = {
  adults: number;
  children: number;
  infants: number;
};

type TrackedSteps = {
  dates: boolean;
  room: boolean;
  guests: boolean;
  promo: boolean;
};

const DEFAULT_GUESTS: Guests = {
  adults: 2,
  children: 0,
  infants: 0,
};

/* =========================================================
   DATE HELPERS
   ========================================================= */

function formatLocalDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function addDays(date: Date, days: number) {
  const next = startOfLocalDay(date);
  next.setDate(next.getDate() + days);

  return next;
}

function differenceInNights(
  checkIn: Date | null,
  checkOut: Date | null,
) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = startOfLocalDay(checkIn);
  const end = startOfLocalDay(checkOut);

  const diff =
    end.getTime() - start.getTime();

  if (diff <= 0) {
    return 0;
  }

  return Math.round(
    diff / (1000 * 60 * 60 * 24),
  );
}

/* =========================================================
   COMPONENT
   ========================================================= */

export function BookingWidget() {
  const router = useRouter();

  const [checkIn, setCheckIn] =
    useState<Date | null>(null);

  const [checkOut, setCheckOut] =
    useState<Date | null>(null);

  const [guests, setGuests] =
    useState<Guests>(DEFAULT_GUESTS);

  const [showGuests, setShowGuests] =
    useState(false);

  const [roomId, setRoomId] =
    useState("");

  const [promoCode, setPromoCode] =
    useState("");

  const [showPromo, setShowPromo] =
    useState(false);

  const [rooms, setRooms] = useState<
    Room[]
  >([]);

  const [
    isLoadingRooms,
    setIsLoadingRooms,
  ] = useState(true);

  const [isChecking, setIsChecking] =
    useState(false);

  const [
    isLoadingPrice,
    setIsLoadingPrice,
  ] = useState(false);

  const [
    priceEstimate,
    setPriceEstimate,
  ] = useState<number | null>(null);

  const [
    nightsEstimate,
    setNightsEstimate,
  ] = useState(0);

  const [
    trackedSteps,
    setTrackedSteps,
  ] = useState<TrackedSteps>({
    dates: false,
    room: false,
    guests: false,
    promo: false,
  });

  const guestsRef =
    useRef<HTMLDivElement | null>(null);

  /* =========================================================
     DERIVED DATA
     ========================================================= */

  const selectedRoom = useMemo(
    () =>
      rooms.find(
        (room) => room.id === roomId,
      ) ?? null,
    [rooms, roomId],
  );

  const totalGuests =
    guests.adults +
    guests.children +
    guests.infants;

  const chargeableGuests =
    guests.adults + guests.children;

  const roomMaxGuests =
    selectedRoom?.max_guests ?? 6;

  const nights =
    nightsEstimate ||
    differenceInNights(
      checkIn,
      checkOut,
    );

  const hasValidDates =
    Boolean(checkIn && checkOut) &&
    differenceInNights(
      checkIn,
      checkOut,
    ) > 0;

  const canSubmit =
    Boolean(roomId) &&
    hasValidDates &&
    !isChecking &&
    chargeableGuests > 0 &&
    chargeableGuests <= roomMaxGuests;

  /* =========================================================
     UTM
     ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const utm = readUtmFromSearch(
      window.location.search,
    );

    saveUtmToStorage(utm);
  }, []);

  /* =========================================================
     LOAD ROOMS
     ========================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    const fetchRooms = async () => {
      try {
        setIsLoadingRooms(true);

        const res = await fetch(
          "/api/rooms",
          {
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error(
            "Impossible de charger les chambres",
          );
        }

        const data = await res.json();

        const fetchedRooms: Room[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.rooms)
              ? data.rooms
              : [];

        setRooms(fetchedRooms);

        /*
         * On peut présélectionner la première chambre
         * sans déclencher artificiellement l'analytics.
         */
        if (fetchedRooms.length > 0) {
          setRoomId(
            String(fetchedRooms[0].id),
          );
        }
      } catch (err) {
        if (
          (err as Error).name !==
          "AbortError"
        ) {
          console.error(
            "Error fetching rooms:",
            err,
          );

          setRooms([]);
        }
      } finally {
        setIsLoadingRooms(false);
      }
    };

    void fetchRooms();

    return () => {
      controller.abort();
    };
  }, []);

  /* =========================================================
     CLOSE GUESTS WHEN CLICKING OUTSIDE
     ========================================================= */

  useEffect(() => {
    if (!showGuests) {
      return;
    }

    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as Node | null;

      if (
        target &&
        guestsRef.current &&
        !guestsRef.current.contains(
          target,
        )
      ) {
        setShowGuests(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, [showGuests]);

  /* =========================================================
     ESCAPE
     ========================================================= */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setShowGuests(false);
        setShowPromo(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /* =========================================================
     RESET GUESTS IF ROOM CAPACITY CHANGES
     ========================================================= */

  useEffect(() => {
    if (!selectedRoom) {
      return;
    }

    const max =
      selectedRoom.max_guests;

    setGuests((current) => {
      const currentChargeable =
        current.adults +
        current.children;

      if (currentChargeable <= max) {
        return current;
      }

      /*
       * Toujours au moins 1 adulte.
       * On réduit d'abord les enfants.
       */
      const adults = Math.min(
        current.adults,
        max,
      );

      const children = Math.max(
        0,
        max - adults,
      );

      return {
        ...current,
        adults: Math.max(1, adults),
        children,
      };
    });
  }, [selectedRoom]);

  /* =========================================================
     PRICING
     ========================================================= */

  useEffect(() => {
    if (
      !roomId ||
      !checkIn ||
      !checkOut ||
      differenceInNights(
        checkIn,
        checkOut,
      ) <= 0
    ) {
      setPriceEstimate(null);
      setNightsEstimate(0);
      return;
    }

    const controller =
      new AbortController();

    const fetchPricing = async () => {
      try {
        setIsLoadingPrice(true);

        const res = await fetch(
          "/api/reservations/pricing",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              room_id: roomId,

              check_in:
                formatLocalDate(
                  checkIn,
                ),

              check_out:
                formatLocalDate(
                  checkOut,
                ),

              adults_count:
                guests.adults,

              children_count:
                guests.children,
            }),

            signal: controller.signal,
          },
        );

        const data = await res.json();

        if (!res.ok) {
          setPriceEstimate(null);
          setNightsEstimate(0);

          return;
        }

        const total = Number(
          data.total_price ?? 0,
        );

        const apiNights = Number(
          data.nights ?? 0,
        );

        setPriceEstimate(
          Number.isFinite(total)
            ? total
            : null,
        );

        setNightsEstimate(
          Number.isFinite(apiNights)
            ? apiNights
            : 0,
        );
      } catch (err) {
        if (
          (err as Error).name !==
          "AbortError"
        ) {
          console.error(
            "Pricing request failed:",
            err,
          );

          setPriceEstimate(null);
          setNightsEstimate(0);
        }
      } finally {
        setIsLoadingPrice(false);
      }
    };

    void fetchPricing();

    return () => {
      controller.abort();
    };
  }, [
    roomId,
    checkIn,
    checkOut,
    guests.adults,
    guests.children,
  ]);

  /* =========================================================
     FALLBACK LOCAL ESTIMATE

     Important :
     - utilisé seulement si l'API pricing n'a pas fourni de prix
     - le backend doit rester l'autorité finale du prix
     ========================================================= */

  const calculateFallbackTotal = () => {
    if (
      !selectedRoom ||
      nights <= 0
    ) {
      return 0;
    }

    let total =
      selectedRoom.base_price *
      nights;

    /*
     * Estimation locale uniquement.
     * À déplacer idéalement entièrement côté backend.
     */
    if (nights >= 7) {
      total *= 0.9;
    }

    if (
      promoCode.trim().toUpperCase() ===
      "RIAD10"
    ) {
      total *= 0.9;
    }

    return Math.round(total);
  };

  const displayedTotal =
    priceEstimate !== null
      ? Math.round(priceEstimate)
      : calculateFallbackTotal();

  /* =========================================================
     TRACKING HELPERS
     ========================================================= */

  const markTracked = (
    key: keyof TrackedSteps,
  ) => {
    setTrackedSteps((current) => ({
      ...current,
      [key]: true,
    }));
  };

  /* =========================================================
     DATE HANDLERS
     ========================================================= */

  const handleCheckInChange = (
    date: Date | null,
  ) => {
    setCheckIn(date);

    if (
      !trackedSteps.dates &&
      date
    ) {
      trackEvent(
        "booking_step_dates",
        {
          source: "widget",
        },
      );

      markTracked("dates");
    }

    if (
      date &&
      checkOut &&
      startOfLocalDay(checkOut) <=
        startOfLocalDay(date)
    ) {
      setCheckOut(null);
    }
  };

  const handleCheckOutChange = (
    date: Date | null,
  ) => {
    setCheckOut(date);

    if (
      !trackedSteps.dates &&
      date
    ) {
      trackEvent(
        "booking_step_dates",
        {
          source: "widget",
        },
      );

      markTracked("dates");
    }
  };

  /* =========================================================
     ROOM
     ========================================================= */

  const handleRoomChange = (
    value: string,
  ) => {
    setRoomId(value);

    if (
      value &&
      !trackedSteps.room
    ) {
      trackEvent(
        "booking_step_room",
        {
          source: "widget",
        },
      );

      markTracked("room");
    }
  };

  /* =========================================================
     GUESTS
     ========================================================= */

  const updateGuests = (
    type: keyof Guests,
    delta: number,
  ) => {
    setGuests((current) => {
      const next = {
        ...current,
      };

      if (type === "adults") {
        next.adults = Math.max(
          1,
          current.adults + delta,
        );
      }

      if (type === "children") {
        next.children = Math.max(
          0,
          current.children + delta,
        );
      }

      if (type === "infants") {
        next.infants = Math.max(
          0,
          current.infants + delta,
        );
      }

      /*
       * max_guests concerne ici adultes + enfants.
       * Les bébés restent hors capacité commerciale.
       *
       * Si ta règle métier est différente,
       * adapte ce bloc au backend.
       */
      if (
        next.adults +
          next.children >
        roomMaxGuests
      ) {
        return current;
      }

      return next;
    });

    if (!trackedSteps.guests) {
      trackEvent(
        "booking_step_guests",
        {
          source: "widget",
        },
      );

      markTracked("guests");
    }
  };

  /* =========================================================
     PROMO
     ========================================================= */

  const handlePromoChange = (
    value: string,
  ) => {
    const normalized =
      value.toUpperCase();

    setPromoCode(normalized);

    if (
      normalized.trim() &&
      !trackedSteps.promo
    ) {
      trackEvent(
        "promo_entered",
        {
          source: "widget",
        },
      );

      markTracked("promo");
    }
  };

  const localPromoValid =
    promoCode.trim().toUpperCase() ===
    "RIAD10";

  /* =========================================================
     SUBMIT
     ========================================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !checkIn ||
      !checkOut ||
      !roomId
    ) {
      toast.error(
        "Veuillez sélectionner les dates et la chambre",
      );

      return;
    }

    if (
      differenceInNights(
        checkIn,
        checkOut,
      ) <= 0
    ) {
      toast.error(
        "La date de départ doit être postérieure à la date d'arrivée",
      );

      return;
    }

    if (
      chargeableGuests >
      roomMaxGuests
    ) {
      toast.error(
        `Cette chambre accepte au maximum ${roomMaxGuests} voyageur${
          roomMaxGuests > 1
            ? "s"
            : ""
        }.`,
      );

      return;
    }

    const check_in =
      formatLocalDate(checkIn);

    const check_out =
      formatLocalDate(checkOut);

    trackEvent(
      "booking_check",
      {
        source: "widget",
      },
    );

    try {
      setIsChecking(true);

      const res = await fetch(
        "/api/reservations/availability",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            room_id: roomId,

            check_in,
            check_out,

            adults_count:
              guests.adults,

            children_count:
              guests.children,

            guest_count:
              totalGuests,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.error ||
            "Vérification indisponible",
        );

        return;
      }

      const params =
        new URLSearchParams({
          checkIn: check_in,
          checkOut: check_out,

          roomId,

          adults:
            guests.adults.toString(),

          children:
            guests.children.toString(),

          infants:
            guests.infants.toString(),

          status: data.available
            ? "available"
            : "unavailable",
        });

      if (promoCode.trim()) {
        params.set(
          "promo",
          promoCode.trim(),
        );
      }

      const utm =
        getUtmFromStorage();

      appendUtmToSearchParams(
        params,
        utm,
      );

      if (data.available) {
        toast.success(
          "Chambre disponible, formulaire prérempli",
        );

        trackEvent(
          "booking_available",
          {
            source: "widget",
            room_id: roomId,
          },
        );
      } else {
        toast.error(
          "Désolé, la chambre n'est pas disponible pour ces dates",
        );

        trackEvent(
          "booking_unavailable",
          {
            source: "widget",
            room_id: roomId,
          },
        );
      }

      router.push(
        `/reservations?${params.toString()}`,
      );
    } catch (err) {
      console.error(
        "Availability check failed:",
        err,
      );

      toast.error(
        "Erreur lors de la vérification",
      );
    } finally {
      setIsChecking(false);
    }
  };

  /* =========================================================
     UI HELPERS
     ========================================================= */

  const guestSummary = [
    `${guests.adults} ${
      guests.adults === 1
        ? "adulte"
        : "adultes"
    }`,

    guests.children > 0
      ? `${guests.children} ${
          guests.children === 1
            ? "enfant"
            : "enfants"
        }`
      : null,

    guests.infants > 0
      ? `${guests.infants} ${
          guests.infants === 1
            ? "bébé"
            : "bébés"
        }`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  const inputClasses = `
    w-full
    h-[48px]
    rounded-xl
    border
    border-[#B28A47]/25
    bg-[#FFFDF8]/80
    px-4
    text-[15px]
    text-gray-900
    outline-none
    transition
    duration-200
    placeholder:text-gray-400
    hover:border-[#B28A47]/40
    focus:border-[#B28A47]/55
    focus:ring-2
    focus:ring-[#B28A47]/15
  `;

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="site-container relative z-20 -mt-20">
      <div
        className="
          lux-panel
          mx-auto
          max-w-6xl
          rounded-[28px]
          border
          border-[#B28A47]/20
          bg-[#FFFDF8]/95
          p-5
          shadow-[0_28px_80px_-50px_rgba(35,20,12,0.42)]
          backdrop-blur-xl
          sm:p-6
          md:p-8
        "
      >
        {/* HEADER */}

        <div className="mb-8 text-center">
          <p
            className="
              mb-3
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.28em]
              text-[#B28A47]
            "
          >
            Votre séjour à Fès
          </p>

          <h3
            className="
              mb-3
              font-serif
              text-3xl
              font-medium
              tracking-[-0.02em]
              text-[#201A17]
              md:text-4xl
            "
          >
            Réservez votre séjour
          </h3>

          <p
            className="
              text-sm
              leading-relaxed
              text-gray-500
              sm:text-[15px]
            "
          >
            Meilleur prix garanti
            <span className="mx-2 text-[#B28A47]/60">
              •
            </span>
            Annulation gratuite
            <span className="mx-2 text-[#B28A47]/60">
              •
            </span>
            Petit-déjeuner inclus
          </p>
        </div>

        <form
          className="space-y-7"
          onSubmit={handleSubmit}
        >
          {/* =================================================
              MAIN FIELDS
              ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-12
            "
          >
            {/* ARRIVÉE */}

            <div className="md:col-span-3">
              <label
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                <Calendar
                  size={16}
                  strokeWidth={1.7}
                  className="text-[#B28A47]"
                />

                Arrivée
              </label>

              <div className="relative">
                <DatePicker
                  selected={checkIn}
                  onChange={
                    handleCheckInChange
                  }
                  className={`${inputClasses} pl-10`}
                  placeholderText="Date d'arrivée"
                  dateFormat="dd/MM/yyyy"
                  minDate={
                    startOfLocalDay(
                      new Date(),
                    )
                  }
                />

                <Calendar
                  size={18}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-[#B28A47]/75
                  "
                />
              </div>
            </div>

            {/* DÉPART */}

            <div className="md:col-span-3">
              <label
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                <Calendar
                  size={16}
                  strokeWidth={1.7}
                  className="text-[#B28A47]"
                />

                Départ
              </label>

              <div className="relative">
                <DatePicker
                  selected={checkOut}
                  onChange={
                    handleCheckOutChange
                  }
                  className={`${inputClasses} pl-10`}
                  placeholderText="Date de départ"
                  dateFormat="dd/MM/yyyy"
                  minDate={
                    checkIn
                      ? addDays(
                          checkIn,
                          1,
                        )
                      : addDays(
                          new Date(),
                          1,
                        )
                  }
                />

                <Calendar
                  size={18}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-[#B28A47]/75
                  "
                />
              </div>
            </div>

            {/* VOYAGEURS */}

            <div
              ref={guestsRef}
              className="
                relative
                md:col-span-3
              "
            >
              <label
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                <Users
                  size={16}
                  strokeWidth={1.7}
                  className="text-[#B28A47]"
                />

                Voyageurs
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowGuests(
                    (current) =>
                      !current,
                  )
                }
                aria-expanded={
                  showGuests
                }
                className={`
                  ${inputClasses}
                  flex
                  items-center
                  justify-between
                  text-left
                `}
              >
                <span className="truncate">
                  {guestSummary}
                </span>

                <ChevronDown
                  size={18}
                  className={`
                    shrink-0
                    text-gray-400
                    transition-transform
                    duration-200
                    ${
                      showGuests
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              {showGuests && (
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-[calc(100%+10px)]
                    z-50
                    rounded-2xl
                    border
                    border-[#B28A47]/20
                    bg-[#FFFDF8]
                    p-4
                    shadow-[0_20px_50px_-20px_rgba(35,20,12,0.28)]
                  "
                >
                  <GuestRow
                    label="Adultes"
                    description="13 ans et plus"
                    value={
                      guests.adults
                    }
                    minimum={1}
                    decrement={() =>
                      updateGuests(
                        "adults",
                        -1,
                      )
                    }
                    increment={() =>
                      updateGuests(
                        "adults",
                        1,
                      )
                    }
                    disableIncrement={
                      chargeableGuests >=
                      roomMaxGuests
                    }
                  />

                  <div className="my-3 h-px bg-[#B28A47]/10" />

                  <GuestRow
                    label="Enfants"
                    description="2 à 12 ans"
                    value={
                      guests.children
                    }
                    minimum={0}
                    decrement={() =>
                      updateGuests(
                        "children",
                        -1,
                      )
                    }
                    increment={() =>
                      updateGuests(
                        "children",
                        1,
                      )
                    }
                    disableIncrement={
                      chargeableGuests >=
                      roomMaxGuests
                    }
                  />

                  <div className="my-3 h-px bg-[#B28A47]/10" />

                  <GuestRow
                    label="Bébés"
                    description="Moins de 2 ans"
                    value={
                      guests.infants
                    }
                    minimum={0}
                    decrement={() =>
                      updateGuests(
                        "infants",
                        -1,
                      )
                    }
                    increment={() =>
                      updateGuests(
                        "infants",
                        1,
                      )
                    }
                  />

                  {selectedRoom && (
                    <p
                      className="
                        mt-4
                        border-t
                        border-[#B28A47]/10
                        pt-3
                        text-xs
                        leading-relaxed
                        text-gray-500
                      "
                    >
                      Capacité de la
                      chambre :{" "}
                      {
                        selectedRoom.max_guests
                      }{" "}
                      voyageur
                      {selectedRoom.max_guests >
                      1
                        ? "s"
                        : ""}
                      .
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* CHAMBRE */}

            <div className="md:col-span-3">
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Chambre
              </label>

              {isLoadingRooms ? (
                <div
                  className={`
                    ${inputClasses}
                    flex
                    items-center
                    justify-center
                    gap-2
                  `}
                >
                  <Loader
                    size={16}
                    className="animate-spin text-[#0F5A46]"
                  />

                  <span className="text-sm text-gray-500">
                    Chargement...
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={roomId}
                    onChange={(event) =>
                      handleRoomChange(
                        event.target
                          .value,
                      )
                    }
                    className={`
                      ${inputClasses}
                      appearance-none
                      pr-10
                    `}
                  >
                    <option value="">
                      Sélectionner
                    </option>

                    {rooms.map(
                      (room) => (
                        <option
                          key={
                            room.id
                          }
                          value={String(
                            room.id,
                          )}
                        >
                          {room.name} —{" "}
                          {
                            room.base_price
                          }{" "}
                          MAD/nuit
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              PROMO + PRICE
              ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              items-start
              gap-6
              border-t
              border-[#B28A47]/10
              pt-6
              md:grid-cols-2
            "
          >
            {/* PROMO */}

            <div>
              <button
                type="button"
                onClick={() =>
                  setShowPromo(
                    (current) =>
                      !current,
                  )
                }
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-[#0F5A46]
                  transition-colors
                  hover:text-[#12604B]
                "
              >
                <span>
                  Code promo ?
                </span>

                <ChevronDown
                  size={15}
                  className={`
                    transition-transform
                    duration-200
                    ${
                      showPromo
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              {showPromo && (
                <div className="mt-3 max-w-sm">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(event) =>
                      handlePromoChange(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Entrez votre code"
                    autoComplete="off"
                    className={
                      inputClasses
                    }
                  />

                  {localPromoValid && (
                    <p
                      className="
                        mt-2
                        flex
                        items-center
                        gap-1.5
                        text-sm
                        font-medium
                        text-[#0F5A46]
                      "
                    >
                      <Check
                        size={15}
                      />

                      Remise estimée
                      appliquée
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* PRICE */}

{/* PRICE */}

<div className="md:text-right">
  {isLoadingPrice && checkIn && checkOut ? (
    <div
      className="
        inline-flex
        items-center
        gap-2
        text-sm
        text-gray-500
      "
    >
      <Loader
        size={15}
        className="animate-spin"
        aria-hidden="true"
      />

      Calcul du prix...
    </div>
  ) : nights > 0 ? (
    <>
      <div
        className="
          font-serif
          text-xl
          font-medium
          text-[#201A17]
        "
      >
        {nights} nuit{nights > 1 ? "s" : ""}
        <span className="mx-2 text-[#B28A47]/60">
          ·
        </span>
        {displayedTotal.toLocaleString("fr-FR")} MAD
      </div>

      <div className="mt-1 text-sm text-gray-500">
        Taxes et frais inclus
      </div>
    </>
  ) : (
    <div>
      <div
        className="
          font-serif
          text-lg
          font-medium
          text-[#201A17]
        "
      >
        Sélectionnez vos dates
      </div>

      <div className="mt-1 text-sm text-gray-500">
        Le tarif de votre séjour apparaîtra ici
      </div>
    </div>
  )}
</div>
          </div>

          {/* =================================================
              MAIN CTA
              ================================================= */}

          <div className="text-center">
            <button
              type="submit"
              disabled={!canSubmit}
              aria-busy={isChecking}
              className="
                group
                relative
                mx-auto
                inline-flex
                h-[54px]
                w-full
                items-center
                justify-center
                gap-3
                overflow-hidden
                rounded-full

                border
                border-[rgba(178,138,71,0.38)]

                bg-[#0F5A46]

                px-8

                text-[15px]
                font-semibold
                tracking-[0.01em]
                text-[#FFFDF8]

                shadow-[0_10px_28px_rgba(15,90,70,0.20)]

                transition-all
                duration-200
                ease-out

                hover:-translate-y-px
                hover:bg-[#12604B]
                hover:shadow-[0_13px_32px_rgba(15,90,70,0.26)]

                active:translate-y-0
                active:bg-[#0B493A]
                active:shadow-[0_6px_18px_rgba(15,90,70,0.16)]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#B28A47]/70
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[#FFFDF8]

                disabled:cursor-not-allowed
                disabled:opacity-50
                disabled:hover:translate-y-0
                disabled:hover:bg-[#0F5A46]
                disabled:hover:shadow-[0_10px_28px_rgba(15,90,70,0.20)]

                sm:w-auto
                sm:min-w-[310px]
                sm:px-9
              "
            >
              {/* subtle hover light */}

              <span
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  opacity-0
                  transition-opacity
                  duration-300
                  group-hover:opacity-100
                "
                aria-hidden="true"
              >
                <span
                  className="
                    absolute
                    -inset-24
                    bg-[radial-gradient(circle_at_28%_40%,rgba(255,253,248,0.10),transparent_52%)]
                  "
                />
              </span>

              <span className="relative z-10 inline-flex items-center">
                {isChecking ? (
                  <Loader
                    size={19}
                    strokeWidth={1.8}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Search
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                )}
              </span>

              <span className="relative z-10">
                {isChecking
                  ? "Vérification..."
                  : "Vérifier la disponibilité"}
              </span>

              {!isChecking && (
                <ArrowRight
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="
                    relative
                    z-10
                    text-[#D2AA5A]
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              )}
            </button>
          </div>
        </form>

        {/* ===================================================
            BENEFITS
            =================================================== */}

        <div
          className="
            mt-8
            border-t
            border-[#B28A47]/10
            pt-7
          "
        >
          <div
            className="
              grid
              grid-cols-2
              gap-x-4
              gap-y-6
              text-center
              md:grid-cols-4
            "
          >
            <Benefit
              marker="✓"
              text="Meilleur prix garanti"
            />

            <Benefit
              marker="✓"
              text="Annulation gratuite"
            />

            <Benefit
              marker="✓"
              text="Sans frais cachés"
            />

            <Benefit
              marker="24/7"
              text="Support client"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   GUEST ROW
   ========================================================= */

interface GuestRowProps {
  label: string;
  description: string;
  value: number;
  minimum: number;
  decrement: () => void;
  increment: () => void;
  disableIncrement?: boolean;
}

function GuestRow({
  label,
  description,
  value,
  minimum,
  decrement,
  increment,
  disableIncrement = false,
}: GuestRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {label}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= minimum}
          aria-label={`Diminuer ${label.toLowerCase()}`}
          className="
            inline-flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            border-[#B28A47]/25
            text-[#0F5A46]
            transition
            hover:border-[#B28A47]/50
            hover:bg-[#B28A47]/5
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <Minus size={14} />
        </button>

        <span className="min-w-5 text-center text-sm font-semibold text-gray-900">
          {value}
        </span>

        <button
          type="button"
          onClick={increment}
          disabled={disableIncrement}
          aria-label={`Augmenter ${label.toLowerCase()}`}
          className="
            inline-flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            border-[#B28A47]/25
            text-[#0F5A46]
            transition
            hover:border-[#B28A47]/50
            hover:bg-[#B28A47]/5
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   BENEFIT
   ========================================================= */

function Benefit({
  marker,
  text,
}: {
  marker: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="
          mb-1
          text-sm
          font-bold
          text-[#B28A47]
        "
      >
        {marker}
      </div>

      <div
        className="
          text-xs
          leading-relaxed
          text-gray-500
          sm:text-sm
        "
      >
        {text}
      </div>
    </div>
  );
}