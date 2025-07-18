import { useFormContext } from "react-hook-form";

export default function ImageUploadStep({ back }: { back: () => void }) {
  const { register } = useFormContext();

  return (
    <div>
      <h2>Upload Profile Image</h2>
      <input type="file" {...register("imgUrl")} />
      <div className="flex justify-between">
        <button type="button" onClick={back}>Back</button>
        <button type="submit">Finish</button>
      </div>
    </div>
  );
}
