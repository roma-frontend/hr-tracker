"use client";

import { useRef, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, CheckCircle, XCircle, Loader2, ScanFace } from "lucide-react";
import { toast } from "sonner";
import { detectFace, loadFaceApiModels, findBestMatch, isFaceMatch } from "@/lib/faceApi";
import { useAuthStore } from "@/store/useAuthStore";
import { loginAction } from "@/actions/auth";
import { useRouter } from "next/navigation";

export function FaceLogin() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [matchStatus, setMatchStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const [matchedUser, setMatchedUser] = useState<string | null>(null);

  const setUser = useAuthStore((state) => state.setUser);
  const allFaceDescriptors = useQuery(api.faceRecognition.getAllFaceDescriptors);
  const verifyFaceLogin = useMutation(api.faceRecognition.verifyFaceLogin);

  useEffect(() => {
    // Load models on mount
    loadFaceApiModels().catch((err) => {
      console.error("Failed to load face models:", err);
      toast.error("Failed to load face recognition models");
    });

    return () => {
      // Cleanup webcam on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsWebcamActive(true);
        
        // Start face detection loop
        detectFaceLoop();
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast.error("Unable to access webcam. Please grant camera permissions.");
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsWebcamActive(false);
    setFaceDetected(false);
    setMatchStatus("idle");
    setMatchedUser(null);
  };

  const detectFaceLoop = () => {
    if (!videoRef.current || !isWebcamActive) return;

    const interval = setInterval(async () => {
      if (!videoRef.current || !isWebcamActive) {
        clearInterval(interval);
        return;
      }

      try {
        const detection = await detectFace(videoRef.current);
        setFaceDetected(!!detection);
      } catch (error) {
        // Ignore detection errors during loop
      }
    }, 500);

    return () => clearInterval(interval);
  };

  const attemptFaceLogin = async () => {
    if (!videoRef.current || !allFaceDescriptors || allFaceDescriptors.length === 0) {
      toast.error("No registered faces found in the system.");
      return;
    }

    setIsProcessing(true);
    setMatchStatus("searching");

    try {
      // Detect face and get descriptor
      const detection = await detectFace(videoRef.current);

      if (!detection) {
        toast.error("No face detected. Please position your face in the frame.");
        setIsProcessing(false);
        setMatchStatus("not_found");
        setTimeout(() => setMatchStatus("idle"), 2000);
        return;
      }

      // Get face descriptor
      const descriptor = detection.descriptor;

      // Find best match from registered faces
      const knownFaces = allFaceDescriptors.map((user) => ({
        userId: user.userId,
        name: user.name,
        descriptor: user.faceDescriptor,
      }));

      const bestMatch = findBestMatch(descriptor, knownFaces);

      if (!bestMatch) {
        toast.error("No matching face found.");
        setMatchStatus("not_found");
        setTimeout(() => setMatchStatus("idle"), 2000);
        setIsProcessing(false);
        return;
      }

      // Check if match is good enough (threshold: 0.6)
      if (!isFaceMatch(bestMatch.distance, 0.6)) {
        toast.error(`Face not recognized. Confidence too low.`);
        setMatchStatus("not_found");
        setTimeout(() => setMatchStatus("idle"), 2000);
        setIsProcessing(false);
        return;
      }

      // Match found!
      setMatchedUser(bestMatch.name);
      setMatchStatus("found");

      // Verify login and get user data
      const userData = await verifyFaceLogin({
        userId: bestMatch.userId as any,
      });

      // Create session via server action
      const matchedUserData = allFaceDescriptors.find(u => u.userId === bestMatch.userId);
      if (!matchedUserData) {
        throw new Error("User data not found");
      }

      await loginAction({
        email: matchedUserData.email,
        password: "", // Face login doesn't use password
        isFaceLogin: true,
      });

      // Update auth store
      setUser({
        id: userData.userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        position: userData.position,
        employeeType: userData.employeeType,
        avatar: userData.avatar,
      });

      toast.success(`Welcome back, ${userData.name}! 👋`);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (error) {
      console.error("Error during face login:", error);
      toast.error("Failed to login with Face ID. Please try again.");
      setMatchStatus("not_found");
      setTimeout(() => setMatchStatus("idle"), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 bg-[var(--surface-base)] border-[var(--border-primary)]">
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
            <ScanFace className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Face ID Login
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Position your face in the camera to login
          </p>
        </div>

        {/* Camera Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {!isWebcamActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
              <Camera className="w-16 h-16 mb-4" />
              <p className="text-sm">Camera not active</p>
            </div>
          )}

          {isWebcamActive && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Face detection indicator */}
              <div className="absolute top-4 right-4">
                {faceDetected ? (
                  <div className="flex items-center gap-2 bg-green-500/90 text-white px-3 py-1.5 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Face Detected
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-sm">
                    <XCircle className="w-4 h-4" />
                    No Face
                  </div>
                )}
              </div>

              {/* Match status */}
              {matchStatus !== "idle" && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  {matchStatus === "searching" && (
                    <div className="flex items-center gap-2 bg-blue-500/90 text-white px-4 py-2 rounded-full text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching for match...
                    </div>
                  )}
                  {matchStatus === "found" && matchedUser && (
                    <div className="flex items-center gap-2 bg-green-500/90 text-white px-4 py-2 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Welcome, {matchedUser}!
                    </div>
                  )}
                  {matchStatus === "not_found" && (
                    <div className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm">
                      <XCircle className="w-4 h-4" />
                      Face not recognized
                    </div>
                  )}
                </div>
              )}

              {/* Face frame guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-64 h-80 border-4 rounded-2xl transition-colors ${
                  faceDetected ? "border-green-500/50" : "border-white/50"
                }`} />
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isWebcamActive && (
            <Button onClick={startWebcam} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Start Face Login
            </Button>
          )}

          {isWebcamActive && (
            <>
              <Button
                onClick={attemptFaceLogin}
                disabled={!faceDetected || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <ScanFace className="w-4 h-4 mr-2" />
                    Scan Face
                  </>
                )}
              </Button>
              <Button onClick={stopWebcam} variant="outline">
                Cancel
              </Button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)]">
            <strong>Note:</strong> Make sure you have registered your face in Settings before using Face ID login.
          </p>
        </div>
      </div>
    </Card>
  );
}
