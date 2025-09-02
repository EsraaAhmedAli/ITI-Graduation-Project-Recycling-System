import api from "@/lib/axios";
import { useState, useCallback} from "react";

interface VoiceUsage {
  count: number;
  limit: number;
  remaining: number;
  resetTime: string;
  lastResetTime: string;
  hoursUntilReset: number;
}

interface UseTranscriptionResult {
  transcribe: (blob: Blob) => Promise<string | null>;
  isLoading: boolean;
  isError: string | null;
  lastTranscription: string | null;
  resetTranscription: () => void;
  usage: VoiceUsage | null;
  checkUsage: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

export const useTranscription = (): UseTranscriptionResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [lastTranscription, setLastTranscription] = useState<string | null>(null);
  const [usage, setUsage] = useState<VoiceUsage | null>(null);

  const checkUsage = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get("/transcription/usage");
      if (response.data.success) {
        setUsage(response.data.usage);
      }
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    }
  }, []);

  const refreshUsage = useCallback(async (): Promise<void> => {
    await checkUsage();
  }, [checkUsage]);


  const transcribe = useCallback(async (blob: Blob): Promise<string | null> => {
    // Check if user has remaining transcriptions
    if (usage && usage.remaining <= 0) {
      setIsError("Daily transcription limit reached. Please try again tomorrow.");
      return null;
    }

    setIsLoading(true);
    setIsError(null);

    const formData = new FormData();
    
    // Convert Blob to File with correct MIME type
    const audioFile = new File([blob], 'recording.m4a', {
      type: 'audio/mp4'
    });
    
    formData.append("audioFile", audioFile);
    formData.append("language", "ar");

    try {
      const response = await api.post("/transcription/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setLastTranscription(response.data.transcription);
        
        // Update usage information from the response
        if (response.data.usage) {
          setUsage(response.data.usage);
        }
        
        return response.data.transcription;
      } else {
        throw new Error(response.data.error || "Transcription failed");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Transcription failed";
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setIsError("Access denied. You don't have permission to use this feature.");
      } else if (err.response?.status === 429) {
        setIsError("Daily transcription limit reached. Please try again tomorrow.");
        // Refresh usage to get the latest count
        await refreshUsage();
      } else if (err.response?.status === 400 && err.response?.data?.error?.includes('file type')) {
        setIsError("Invalid audio format. Please try recording again.");
      } else {
        setIsError(errorMessage);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [usage, refreshUsage]);

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
    usage,
    checkUsage,
    refreshUsage,
  };
};