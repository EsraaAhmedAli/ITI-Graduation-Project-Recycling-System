export default function Step({
  number,
  label,
  active,
}: {
  number: number;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span
        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ${
          active ? 'bg-base-100 text-primary' : 'bg-gray-200 text-gray-800'
        }`}
      >
        {number}
      </span>
      <span className="mt-2 text-base font-medium">{label}</span>
    </div>
  );
}

export function Connector() {
  return <div className="hidden md:block w-12 h-1 bg-gray-300 rounded"></div>;
}
