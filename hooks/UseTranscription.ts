import { useState, useCallback } from "react";

interface UseTranscriptionResult {
  transcribe: (blob: Blob) => Promise<string | null>;
  isLoading: boolean;
  isError: string | null;
  lastTranscription: string | null;
  resetTranscription: () => void;
}

export const useTranscription = (): UseTranscriptionResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [lastTranscription, setLastTranscription] = useState<string | null>(
    null
  );

  const transcribe = useCallback(async (blob: Blob): Promise<string | null> => {
    setIsLoading(true);
    setIsError(null);

    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-large-v3");
    formData.append("language", "ar");
    formData.append("response_format", "json");
    formData.append(
      "prompt",
      "المتحدث يسرد مواد قابلة لإعادة التدوير باللغة العربية المصرية. يجب كتابة النص بالعربية فقط. مواد شائعة تشمل: كرسي، مكواة، بلاستيك، حديد، كولمان مياه، ورق متقطع، كتب، جرايد، كرتون، مراوح، موبايل، لابتوب، طابعة، نحاس، ألومنيوم، ستانلس. يرجى النسخ بدقة مع الكميات والوحدات مثل كيلو وقطعة."
    );

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq Error:", errorData);
        throw new Error("Failed to transcribe audio.");
      }

      const data = await response.json();
      setLastTranscription(data.text);
      return data.text;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Transcription failed";
      console.error("Transcription error:", err);
      setIsError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetTranscription = useCallback(() => {
    setLastTranscription(null);
    setIsError(null);
    setIsLoading(false);
  }, []);

  return {
    transcribe,
    isLoading,
    isError,
    lastTranscription,
    resetTranscription,
  };
};
