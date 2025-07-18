import { useFormContext } from "react-hook-form";

export default function CredentialsStep({
  next,
  back,
}: {
  next: () => void;
  back: () => void;
}) {
  const { register } = useFormContext();

  return (
    <div>
      <h2>Account Info</h2>
      <input {...register("name")} placeholder="Full Name" required />
      <input {...register("email")} placeholder="Email" required />
      <input
        type="password"
        {...register("password")}
        placeholder="Password"
        required
      />
      <input {...register("phoneNumber")} placeholder="Phone Number" required />
      <div className="flex justify-between">
        <button type="button" onClick={back}>
          Back
        </button>
        <button type="button" onClick={next}>
          Next
        </button>
      </div>
    </div>
  );
}
