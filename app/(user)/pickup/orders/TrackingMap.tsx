interface Props { orderStatus: string; }
export function TrackingMap({ orderStatus }: Props) {
  const getPos = () => {
    if (orderStatus === "en_route") return { left: "20%", top: "30%" };
    if (orderStatus === "arrived") return { left: "80%", top: "60%" };
    return { left: "20%", top: "30%" };
  };
  const pos = getPos();
  return (
    <div className="relative border rounded-lg h-48 bg-gray-100 mb-4 overflow-hidden">
      <div className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #e2e8f0 0, #e2e8f0 1px, transparent 1px, transparent 20px)`,
          opacity: 0.3
        }}
      />
      <div className="absolute bottom-3 right-3 text-xs bg-white px-2 py-1 rounded shadow">
        Your Location
      </div>
      <div className="absolute transition-all duration-1000" style={pos}>
        <div className="text-2xl animate-bounce">🚛</div>
        <div className="absolute top-6 left-0 text-xs bg-white px-2 py-1 rounded shadow">
          Driver
        </div>
      </div>
    </div>
  );
} 