"use client";

import { useTranslation } from "react-i18next";
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
  
  const { t } = useTranslation();
const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [matchStatus, setMatchStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const [matchedUser, setMatchedUser] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  const setUser = useAuthStore((state) => state.setUser);
  const allFaceDescriptors = useQuery(api.faceRecognition.getAllFaceDescriptors);
  const verifyFaceLogin = useMutation(api.faceRecognition.verifyFaceLogin);

  useEffect(() => {
    // Load models on mount
    loadFaceApiModels().catch((err) => {
      console.error("Failed to load face models:", err);
      toast.error("Failed to load face recognition models");
    });

    // Get available cameras
    async function getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        console.log("Available cameras:", videoDevices);
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Failed to enumerate devices:", err);
      }
    }
    getCameras();

    return () => {
      // Cleanup webcam on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startWebcam = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Camera access is not supported in this browser. Please use Chrome, Edge, or Firefox.");
        return;
      }

      console.log("🎥 Requesting camera access...");
      console.log("Selected camera:", selectedCamera);
      
      const constraints: MediaStreamConstraints = {
        video: selectedCamera ? {
          deviceId: { exact: selectedCamera },
          width: { ideal: 640 },
          height: { ideal: 480 },
        } : {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user" 
        },
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log("✅ Camera access granted");
      
      // Set state to trigger video element rendering
      setStream(mediaStream);
      setIsWebcamActive(true);
      
      // Wait for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Wait for video element to be available in DOM
      const waitForVideoElement = async (maxAttempts = 20) => {
        for (let i = 0; i < maxAttempts; i++) {
          if (videoRef.current) {
            console.log("📹 Video element found on attempt", i + 1);
            return true;
          }
          console.log(`⏳ Waiting for video element... attempt ${i + 1}`);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        return false;
      };
      
      const videoElementAvailable = await waitForVideoElement();
      
      if (!videoElementAvailable || !videoRef.current) {
        console.error("❌ Video element ref is null after waiting!");
        toast.error("Video element not found. Please try again.");
        // Stop the stream and reset state
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsWebcamActive(false);
        return;
      }
      
      console.log("📹 Setting up video element...");
      videoRef.current.srcObject = mediaStream;
        
        console.log("⏳ Waiting for metadata to load...");
        
        // Ensure video plays
        const playVideo = async () => {
          if (!videoRef.current) {
            console.error("❌ videoRef is null when trying to play");
            return;
          }
          
          try {
            console.log("🎬 Attempting to play video...");
            console.log("Video element state:", {
              readyState: videoRef.current.readyState,
              paused: videoRef.current.paused,
              srcObject: !!videoRef.current.srcObject
            });
            await videoRef.current.play();
            console.log("✅ Video playing successfully");
            console.log("🎯 About to start face detection loop...");
            console.log("videoRef.current exists?", !!videoRef.current);
            console.log("isWebcamActive?", isWebcamActive);
            detectFaceLoop(true); // Force start with true flag
          } catch (err) {
            console.error("❌ Failed to play video:", err);
            toast.error("Failed to start video playback");
          }
        };
        
        // Wait for metadata and play
        videoRef.current.onloadedmetadata = () => {
          console.log("✅ Video metadata loaded");
          playVideo();
        };
        
      // Fallback: try to play after a short delay if metadata event doesn't fire
      setTimeout(() => {
        if (videoRef.current && isWebcamActive) {
          console.log("⚠️ Metadata event didn't fire, trying to play anyway...");
          playVideo();
        }
      }, 1000);
    } catch (error: any) {
      console.error("❌ Error accessing webcam:", error);
      
      // Reset state on error
      setIsWebcamActive(false);
      setStream(null);
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        toast.error("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        toast.error("No camera found. Please connect a camera and try again.");
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        toast.error("Camera is already in use by another application.");
      } else {
        toast.error(`Unable to access camera: ${error.message || "Unknown error"}`);
      }
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

  const detectFaceLoop = (forceStart = false) => {
    console.log("🔄 Starting face detection loop...");
    console.log("forceStart:", forceStart, "videoRef.current:", !!videoRef.current, "isWebcamActive:", isWebcamActive);
    
    if (!videoRef.current) {
      console.warn("⚠️ Cannot start detection loop - videoRef is null");
      return;
    }
    
    if (!forceStart && !isWebcamActive) {
      console.warn("⚠️ Cannot start detection loop - isWebcamActive is false");
      return;
    }

    const interval = setInterval(async () => {
      if (!videoRef.current) {
        console.log("🛑 Stopping face detection loop - videoRef is null");
        clearInterval(interval);
        return;
      }

      try {
        // Check if video is actually playing and has valid dimensions
        if (videoRef.current.readyState < 2) {
          console.log("⏳ Video not ready yet, readyState:", videoRef.current.readyState);
          return;
        }

        const detection = await detectFace(videoRef.current);
        const faceFound = !!detection;
        
        // Only log when face detection status changes
        if (faceFound !== faceDetected) {
          console.log(faceFound ? "✅ Face detected!" : "❌ No face detected");
        }
        
        setFaceDetected(faceFound);
      } catch (error) {
        console.error("❌ Error in face detection loop:", error);
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
      console.log("🔍 Step 1: Detecting face...");
      // Detect face and get descriptor
      const detection = await detectFace(videoRef.current);

      if (!detection) {
        console.error("❌ No face detected in frame");
        toast.error("No face detected. Please position your face in the frame.");
        setIsProcessing(false);
        setMatchStatus("not_found");
        setTimeout(() => setMatchStatus("idle"), 2000);
        return;
      }

      console.log("✅ Face detected, getting descriptor...");
      // Get face descriptor
      const descriptor = detection.descriptor;
      console.log("✅ Descriptor obtained, length:", descriptor.length);

      // Find best match from registered faces
      console.log("🔍 Step 2: Finding best match from", allFaceDescriptors.length, "registered faces");
      const knownFaces = allFaceDescriptors.map((user) => ({
        userId: user.userId,
        name: user.name,
        descriptor: user.faceDescriptor,
      }));

      const bestMatch = findBestMatch(descriptor, knownFaces);
      console.log("🎯 Best match found:", bestMatch);

      if (!bestMatch) {
        console.error("❌ No matching face found");
        toast.error("No matching face found.");
        setMatchStatus("not_found");
        setTimeout(() => setMatchStatus("idle"), 2000);
        setIsProcessing(false);
        return;
      }

      // Check if match is good enough (threshold: 0.6)
      console.log("🔍 Step 3: Checking match quality. Distance:", bestMatch.distance, "Threshold: 0.6");
      if (!isFaceMatch(bestMatch.distance, 0.6)) {
        console.error("❌ Match quality too low. Distance:", bestMatch.distance);
        toast.error(`Face not recognized. Confidence too low.`);
        setMatchStatus("not_found");
        setTimeout(() => setMatchStatus("idle"), 2000);
        setIsProcessing(false);
        return;
      }

      // Match found!
      console.log("✅ Match confirmed! User:", bestMatch.name);
      setMatchedUser(bestMatch.name);
      setMatchStatus("found");

      // Verify login and get user data
      console.log("🔍 Step 4: Verifying login with Convex...");
      const userData = await verifyFaceLogin({
        userId: bestMatch.userId as any,
      });
      console.log("✅ User data from Convex:", userData);

      // Create session via server action
      console.log("🔍 Step 5: Finding matched user data...");
      const matchedUserData = allFaceDescriptors.find(u => u.userId === bestMatch.userId);
      if (!matchedUserData) {
        console.error("❌ User data not found in allFaceDescriptors");
        throw new Error("User data not found");
      }
      console.log("✅ Matched user data:", matchedUserData);

      console.log("🔍 Step 6: Creating session via loginAction...");
      await loginAction({
        email: matchedUserData.email,
        password: "", // Face login doesn't use password
        isFaceLogin: true,
      });
      console.log("✅ Session created successfully");

      // Update auth store
      console.log("🔍 Step 7: Updating auth store...");
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
      console.log("✅ Auth store updated");
      
      // Redirect to dashboard
      console.log("🔍 Step 8: Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (error: any) {
      console.error("❌ Error during face login:", error);
      console.error("Error name:", error?.name);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
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

        {/* Camera Selection */}
        {!isWebcamActive && cameras.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Select Camera:
            </label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-base)] text-[var(--text-primary)]"
            >
              {cameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

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
