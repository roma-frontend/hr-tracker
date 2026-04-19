import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface FaceDescriptor {
  userId: string;
  name: string;
  faceDescriptor: number[];
  email: string;
}

interface FaceIdStatus {
  blocked: boolean;
  failedAttempts: number;
  blockedAt?: number;
  lastAttempt?: number;
}

export function useAllFaceDescriptors() {
  return useQuery({
    queryKey: ['face-descriptors'],
    queryFn: async () => {
      const response = await fetch('/api/face-recognition/descriptors');
      if (!response.ok) {
        throw new Error(t('faceRecognition.fetchDescriptorsFailed'));
      }
      return response.json() as Promise<FaceDescriptor[]>;
    },
  });
}

export function useFaceIdStatus(email: string | null) {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ['face-id-status', email],
    queryFn: async () => {
      if (!email) throw new Error(t('faceRecognition.emailRequired'));
      const response = await fetch(`/api/face-recognition/status?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error(t('faceRecognition.fetchStatusFailed'));
      }
      return response.json() as Promise<FaceIdStatus>;
    },
    enabled: !!email,
  });
}

export function useRegisterFace() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      faceDescriptor: number[];
      faceImageUrl: string;
    }) => {
      const response = await fetch('/api/face-recognition/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('faceRecognition.registerFailed'));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['face-descriptors'] });
      toast.success(t('faceRecognition.registered', t('faceRecognition.registered')));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('faceRecognition.registerFailed', t('faceRecognition.registerFailed')));
    },
  });
}

export function useRecordFaceIdAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; success: boolean }) => {
      const response = await fetch('/api/face-recognition/record-attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('faceRecognition.recordAttemptFailed'));
      }

      return response.json() as Promise<{ attempts: number; blocked: boolean }>;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['face-id-status'] });
    },
  });
}
