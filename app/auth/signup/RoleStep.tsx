import { useFormContext } from "react-hook-form";

export default function RoleStep({ next }: { next: () => void }) {
  const { setValue } = useFormContext();

  return (
    <div>
      <h2>Select Account Type</h2>
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => {
            setValue("role", "customer");
            next();
          }}
        >
          Me - Individual
        </button>
        <button
          type="button"
          onClick={() => {
            setValue("role", "buyer");
            next();
          }}
        >
          My Team - Organization
        </button>
      </div>
    </div>
  );
}
