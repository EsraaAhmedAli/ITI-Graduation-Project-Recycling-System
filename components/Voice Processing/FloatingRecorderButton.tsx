"use client";
import {
  extractMaterialsFromTranscription,
  ExtractedMaterial,
} from "@/hooks/extractMaterials";
import { useTranscription } from "@/hooks/UseTranscription";
import React, { useRef, useState, useEffect } from "react";
import ItemsDisplayCard from "./ItemsDisplayCard";
import { useUserAuth } from "@/context/AuthFormContext";

const FloatingRecorderButton = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showItemsCard, setShowItemsCard] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [processingStarted, setProcessingStarted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const {
    transcribe,
    isLoading,
    isError,
    lastTranscription,
    resetTranscription,
    usage,
    checkUsage,
  } = useTranscription();
  const [structuredData, setStructuredData] = useState<
    ExtractedMaterial[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingUsage, setCheckingUsage] = useState(false);

  const { user } = useUserAuth();
  const isAuthenticated = !!user;



  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (
      structuredData &&
      !loading &&
      !isLoading &&
      structuredData.length > 0 &&
      processingStarted
    ) {
      console.log("✅ AI Processing Complete!");
      console.log("Structured Data:", structuredData);
      setShowItemsCard(true);
      setShowCard(false);
      setProcessingStarted(false);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
    }
  }, [structuredData, loading, isLoading, processingStarted]);

  useEffect(() => {
    if (error && !loading) {
      console.error("❌ AI Processing Error:", error);
    }
  }, [error, loading]);

  useEffect(() => {
    console.log("🔍 Debug extractMaterials states:", {
      lastTranscription,
      loading,
      error,
      structuredData,
      hasTranscription: !!lastTranscription,
    });
  }, [lastTranscription, loading, error, structuredData]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

const canRecord = () => {
  if (!isAuthenticated) return false;
  if (checkingUsage) return false; // Disable while checking usage
  if (!usage) return false; // Don't allow if usage data isn't loaded yet
  return usage.remaining > 0;
};
  const getUsageMessage = () => {
    if (!isAuthenticated) {
      return "Please log in to use voice recording";
    }
    
    if (!usage) {
      return "Loading usage data...";
    }

    if (usage.remaining <= 0) {
      return `Daily limit reached (${usage.count}/${usage.limit}). Resets in ${usage.hoursUntilReset}h`;
    }

    return `${usage.count}/${usage.limit} uses today`;
  };

const getButtonText = () => {
  if (!isAuthenticated) {
    return "Please log in to start recording";
  }
  
  if (checkingUsage) {
    return "Checking usage...";
  }
  
  if (usage && usage.remaining <= 0) {
    return "Daily limit reached";
  }

  return "Start Recording";
};

const handleButtonClick = async () => {
  if (showItemsCard) {
    setShowItemsCard(false);
    return;
  }

  if (!showCard) {
    setShowCard(true);
    // Check usage data when opening the card (only if authenticated)
    if (isAuthenticated) {
      setCheckingUsage(true);
      await checkUsage();
      setCheckingUsage(false);
    }
    return;
  }

  if (showCard && !isRecording) {
    setShowCard(false);
    return;
  }

  if (isRecording) {
    stopRecording();
  }
};

  const startRecording = async () => {
    if (!canRecord()) {
      return;
    }

    try {
      setAudioBlob(null);
      setAudioUrl(null);
      setProcessingStarted(false);
      resetTranscription();
      setStructuredData(null);
      setLoading(false);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        console.log("Audio Blob:", blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      startTimer();
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleDoneClick = async () => {
    if (audioBlob && !lastTranscription) {
      if (!canRecord()) {
        setError("Cannot process: daily limit reached or not authenticated");
        return;
      }

      setProcessingStarted(true);
      try {
        const transcriptionResult = await transcribe(audioBlob);
        if (transcriptionResult) {
          setLoading(true);
          setError(null);
          try {
            const extracted = await extractMaterialsFromTranscription(
              transcriptionResult
            );
            setStructuredData(extracted);
          } catch (err: any) {
            setError(err.message || "AI extraction failed");
            setStructuredData(null);
          }
          setLoading(false);
        } else {
          console.error("Transcription failed");
          setProcessingStarted(false);
        }
      } catch (error) {
        console.error("Error during transcription:", error);
        setProcessingStarted(false);
      }
      return;
    }

    if (structuredData && structuredData.length > 0) {
      setShowItemsCard(true);
      setShowCard(false);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
    } else {
      resetRecordingState();
    }
  };

  const resetRecordingState = () => {
    setShowCard(false);
    setShowItemsCard(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setProcessingStarted(false);
    resetTranscription();
    setStructuredData(null);
    setLoading(false);
    setError(null);
  };

  const cancelRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    resetRecordingState();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {showItemsCard && structuredData && structuredData.length > 0 && (
        <ItemsDisplayCard
          items={structuredData}
          onClose={() => setShowItemsCard(false)}
        />
      )}

      {showCard && (
        <div
          className="absolute bottom-20 right-0 rounded-2xl shadow-2xl border border-gray-200 p-6 w-80 mb-4 transform transition-all duration-300 ease-in-out"
          style={{ background: "var(--color-green-60)" }}
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--text-gray-800)" }}
              >
                {isRecording
                  ? "Recording..."
                  : audioBlob
                  ? "Recording Complete"
                  : "Voice Recording"}
              </h3>
              <button
                onClick={cancelRecording}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Usage Display */}
            {isAuthenticated && usage && (
              <div className="flex items-center justify-between bg-white/50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Usage Today
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(usage.limit)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < usage.count
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {usage.count}/{usage.limit}
                  </span>
                </div>
              </div>
            )}

            {/* Reset Time Display */}
            {isAuthenticated && usage && usage.remaining <= 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-orange-700">
                    Resets in {usage.hoursUntilReset} hours
                  </span>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-blue-700">
                      Login Required
                    </span>
                  </div>
                  <p className="text-sm text-blue-600">
                    Please log in to use our voice AI assistant and enjoy 3 free transcriptions daily! 🎤✨
                  </p>
                </div>
              </div>
            )}

            {isAuthenticated && !isRecording && !audioBlob && (
              <div className="text-center">
                <p className="text-sm text-gray-600 bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-2 rounded-lg">
                  <span className="font-medium">Feeling lazy?</span> Let AI
                  order instead of you 🤖
                </p>
              </div>
            )}

     {canRecord() && (
  <div className="flex items-center space-x-3">
    {isRecording && (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-red-500 font-medium">REC</span>
      </div>
    )}
    <span className="text-2xl font-mono text-gray-700">
      {formatTime(recordingTime)}
    </span>
  </div>
)}

            {isLoading && (
              <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-blue-700">
                  Processing your voice...
                </span>
              </div>
            )}

            {loading && !isLoading && (
              <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-purple-700">
                  AI is analyzing your order...
                </span>
              </div>
            )}

            {isError && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">{isError}</span>
              </div>
            )}

            {error && !isError && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

          {canRecord() && (
  <div className="flex items-center justify-center space-x-1 h-12">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className={`w-1 bg-gradient-to-t from-primary to-secondary rounded-full transition-all duration-150 ${
          isRecording
            ? `animate-pulse h-${Math.floor(Math.random() * 8) + 2}`
            : "h-2"
        }`}
        style={{
          animationDelay: `${i * 0.1}s`,
          height: isRecording
            ? `${Math.random() * 30 + 10}px`
            : "8px",
        }}
      />
    ))}
  </div>
)}

            {audioUrl && !isRecording && (
              <div className="bg-gray-50 rounded-xl p-4">
                <audio
                  controls
                  src={audioUrl}
                  className="w-full"
                  preload="metadata"
                />
              </div>
            )}

            <div className="flex space-x-3">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  disabled={!canRecord()}
                  className={`
                    flex-1 font-medium py-3 px-4 rounded-xl 
                    transition-colors duration-200 
                    flex items-center justify-center space-x-2
                    ${
                      !canRecord()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 dark:bg-green-400 dark:hover:bg-green-500 text-white dark:text-gray-900"
                    }
                  `}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  <span className="text-sm">{getButtonText()}</span>
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 10h6v4H9z"
                    />
                  </svg>
                  <span>Stop Recording</span>
                </button>
              )}

              {audioBlob && !isRecording && (
                <>
                  <button
                    onClick={cancelRecording}
                    disabled={isLoading || loading}
                    className={`flex-1 font-medium py-3 px-4 rounded-xl transition-colors duration-200 ${
                      isLoading || loading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-500 hover:bg-gray-600 text-white"
                    }`}
                  >
                    Cancel
                  </button>

                  {!lastTranscription && (
                    <button
                      onClick={handleDoneClick}
                      disabled={!canRecord() || isLoading || loading}
                      className={`flex-1 font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 ${
                        !canRecord() || isLoading || loading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {isLoading || loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>
                            {isLoading ? "Processing..." : "AI Analyzing..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Done</span>
                        </>
                      )}
                    </button>
                  )}

                  {lastTranscription && (isLoading || loading) && (
                    <button
                      disabled
                      className="flex-1 bg-gray-300 text-gray-500 cursor-not-allowed font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>
                        {isLoading ? "Processing..." : "AI Analyzing..."}
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleButtonClick}
        className={`
          group relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110
          ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : showItemsCard
              ? "bg-green-600 hover:bg-green-700"
              : showCard
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-green-600 hover:bg-green-700 dark:bg-green-400 dark:hover:bg-green-500"
          }
          text-white font-bold flex items-center justify-center
        `}
        title={
          isRecording
            ? "Stop Recording"
            : showItemsCard
            ? "Close Items"
            : showCard
            ? "Close"
            : getUsageMessage()
        }
      >
        {!showCard && (
          <div className="absolute bottom-16 right-0 mb-2 pointer-events-none">
            <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-xs">
              <div className="flex items-center space-x-2">
                <span>🎤</span>
                <span>
                  {isAuthenticated
                    ? `Voice AI Assistant `
                    : "Please log in to use voice AI"}
                </span>
              </div>
            </div>
            <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}
        
        {isRecording ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 10h6v4H9z"
            />
          </svg>
        ) : showItemsCard ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : showCard ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className={`w-6 h-6 ${!isAuthenticated || (usage && usage.remaining <= 0) ? 'opacity-50' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default FloatingRecorderButton;