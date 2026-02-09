"use client";

import { MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useState } from "react";

export function WhatsAppFloat() {
  const [isHovered, setIsHovered] = useState(false);

  const phoneNumber = "+212661234567";
  const message = "Bonjour, je souhaite avoir des informations sur le riad.";

  const handleClick = () => {
    trackEvent("click_whatsapp", { source: "float" });
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
      >
        {/* Bouton principal */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
          <MessageCircle size={28} />
        </div>

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 bg-gray-900 text-white px-4 py-2 rounded-lg whitespace-nowrap text-sm font-semibold shadow-xl">
            Contactez-nous sur WhatsApp
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
              <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}
