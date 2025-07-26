import { Phone, BadgeCheck } from "lucide-react";

interface DriverInfo {
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  avatarUrl?: string;
}

export default function DriverInfoCard({ name, phoneNumber, licenseNumber, avatarUrl }: DriverInfo) {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200 ${avatarUrl ? 'hidden' : ''}`}>
          {name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{name}</h2>
          <p className="text-sm text-gray-500">Delivery Driver</p>
        </div>
      </div>

      <div className="space-y-2 text-gray-700">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" />
          <span className="font-medium">Phone:</span>
          <span>{phoneNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-blue-600" />
          <span className="font-medium">License:</span>
          <span>{licenseNumber}</span>
        </div>
      </div>
    </div>
  );
} 