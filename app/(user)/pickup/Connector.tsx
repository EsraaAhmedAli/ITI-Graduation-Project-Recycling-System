export default function Connector({
  active,
  vertical
}: {
  active: boolean;
  vertical: boolean;
}) {
  return (
    <div
      className={`
        transition-colors duration-300
        ${vertical 
          ? '' 
          : 'h-0.5 flex-grow mx-2 md:mx-0'}
        ${active ? 'bg-green-700' : 'bg-gray-300'}
      `}
    />
  );
}
