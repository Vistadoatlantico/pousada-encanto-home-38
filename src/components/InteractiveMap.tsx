import React from 'react';

interface InteractiveMapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: string;
}

const InteractiveMap = ({ 
  height = "400px"
}: InteractiveMapProps) => {
  const googleMapsUrl = "https://www.google.com/maps/place/Paradise+Vista+do+Atl%C3%A2ntico/@-9.6181229,-35.6973687,17z/data=!4m20!1m10!3m9!1s0x70147c3f444a883:0x3f033a2b86a6f41b!2sParadise+Vista+do+Atl%C3%A2ntico!5m2!4m1!1i2!8m2!3d-9.6187207!4d-35.6955314!16s%2Fg%2F11gy81wcdh!3m8!1s0x70147c3f444a883:0x3f033a2b86a6f41b!5m2!4m1!1i2!8m2!3d-9.6187207!4d-35.6955314!16s%2Fg%2F11gy81wcdh?hl=pt-BR&entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D";
  const embedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3935.9737858725473!2d-35.69736871426934!3d-9.618122991431887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x70147c3f444a883%3A0x3f033a2b86a6f41b!2sParadise%20Vista%20do%20Atl%C3%A2ntico!5e0!3m2!1spt-BR!2sus!4v1672910000000!5m2!1spt-BR!2sus";

  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg"
        title="Localização Paradise Vista do Atlântico"
      />
      
      {/* Overlay with link to open in Google Maps */}
      <div className="absolute bottom-4 right-4">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 bg-white/90 backdrop-blur-sm text-paradise-blue rounded-md text-sm font-medium hover:bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          📍 Ver no Google Maps
        </a>
      </div>
    </div>
  );
};

export default InteractiveMap;