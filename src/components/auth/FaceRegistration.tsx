"use client";

import { useRef, useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { detectFace, loadFaceApiModels, createCanvasFromVideo, canvasToBlob } from "@/lib/faceApi";
import { uploadAvatarToCloudinary } from "@/actions/cloudinary";
import { Id } from "../../../convex/_generated/dataModel";

interface FaceRegistrationProps {
  userId: Id<"users">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FaceRegistration({ userId, onSuccess, onCancel }: FaceRegistrationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const registerFace = useMutation(api.faceRecognition.registerFace);

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

  const captureFace = async () => {
    if (!videoRef.current) return;

    setIsProcessing(true);

    try {
      // Detect face and get descriptor
      const detection = await detectFace(videoRef.current);

      if (!detection) {
        toast.error("No face detected. Please position your face in the frame.");
        setIsProcessing(false);
        return;
      }

      // Get face descriptor (128-dimensional array)
      const descriptor = Array.from(detection.descriptor);

      // Create canvas and capture image
      const canvas = createCanvasFromVideo(videoRef.current);
      const base64Image = canvas.toDataURL("image/jpeg", 0.95);

      // Upload face image to Cloudinary
      const imageUrl = await uploadAvatarToCloudinary(base64Image, `face-${userId}`);

      // Save to database
      await registerFace({
        userId,
        faceDescriptor: descriptor,
        faceImageUrl: imageUrl,
      });

      setCapturedImage(canvas.toDataURL());
      stopWebcam();
      
      toast.success("Face registered successfully! You can now use Face ID to login.");
      onSuccess?.();
    } catch (error) {
      console.error("Error capturing face:", error);
      toast.error("Failed to register face. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 bg-[var(--surface-base)] border-[var(--border-primary)]">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Register Face ID
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Position your face in the camera frame to register Face ID login
          </p>
        </div>

        {/* Camera Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {!isWebcamActive && !capturedImage && (
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

              {/* Face frame guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-80 border-4 border-white/50 rounded-2xl" />
              </div>
            </>
          )}

          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured face"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isWebcamActive && !capturedImage && (
            <Button onClick={startWebcam} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          )}

          {isWebcamActive && (
            <>
              <Button
                onClick={captureFace}
                disabled={!faceDetected || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Capture & Register
                  </>
                )}
              </Button>
              <Button onClick={stopWebcam} variant="outline">
                Cancel
              </Button>
            </>
          )}

          {capturedImage && onCancel && (
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Close
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Instructions:</h4>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
            <li>Position your face within the frame</li>
            <li>Ensure good lighting on your face</li>
            <li>Look directly at the camera</li>
            <li>Remove glasses or hats if possible</li>
            <li>Wait for "Face Detected" indicator</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
