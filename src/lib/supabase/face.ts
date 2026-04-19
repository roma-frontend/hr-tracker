import { supabase } from '@/lib/supabase/client';

export async function registerFace(
  userId: string,
  faceDescriptor: number[],
  faceImageUrl: string
) {
  const now = Math.floor(Date.now() / 1000);

  const { error } = await supabase
    .from('users')
    .update({
      face_descriptor: faceDescriptor,
      face_image_url: faceImageUrl,
      face_registered_at: now,
      faceid_blocked: false,
      faceid_failed_attempts: 0,
      faceid_last_attempt: null,
      faceid_blocked_at: null,
    })
    .eq('id', userId);

  if (error) throw error;
}

export async function getFaceDescriptor(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('face_descriptor, face_image_url, face_registered_at')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function getAllFaceDescriptors() {
  const { data, error } = await supabase
    .from('users')
    .select('id, face_descriptor, face_image_url')
    .eq('is_active', true)
    .not('face_descriptor', 'is', null);

  if (error) return [];
  return data;
}

export async function removeFaceRegistration(userId: string) {
  const { error } = await supabase
    .from('users')
    .update({
      face_descriptor: null,
      face_image_url: null,
      face_registered_at: null,
      faceid_blocked: null,
      faceid_blocked_at: null,
      faceid_failed_attempts: null,
      faceid_last_attempt: null,
    })
    .eq('id', userId);

  if (error) throw error;
}

export async function recordFaceIdAttempt(userId: string, success: boolean) {
  const now = Math.floor(Date.now() / 1000);
  const { data: user } = await supabase
    .from('users')
    .select('faceid_failed_attempts, faceid_blocked')
    .eq('id', userId)
    .single();

  if (!user) return;

  if (success) {
    await supabase
      .from('users')
      .update({
        faceid_failed_attempts: 0,
        faceid_blocked: false,
        faceid_blocked_at: null,
        faceid_last_attempt: now,
        last_login_at: now,
      })
      .eq('id', userId);
  } else {
    const newAttempts = (user.faceid_failed_attempts || 0) + 1;
    const isBlocked = newAttempts >= 3;

    await supabase
      .from('users')
      .update({
        faceid_failed_attempts: newAttempts,
        faceid_blocked: isBlocked,
        faceid_blocked_at: isBlocked ? now : null,
        faceid_last_attempt: now,
      })
      .eq('id', userId);
  }
}

export async function unblockFaceId(userId: string) {
  const { error } = await supabase
    .from('users')
    .update({
      faceid_blocked: false,
      faceid_blocked_at: null,
      faceid_failed_attempts: 0,
    })
    .eq('id', userId);

  if (error) throw error;
}

export async function checkFaceIdStatus(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('faceid_blocked, faceid_failed_attempts, faceid_blocked_at, faceid_last_attempt')
    .eq('id', userId)
    .single();

  if (error) return { blocked: false, failedAttempts: 0 };

  return {
    blocked: data.faceid_blocked || false,
    failedAttempts: data.faceid_failed_attempts || 0,
    blockedAt: data.faceid_blocked_at,
    lastAttempt: data.faceid_last_attempt,
  };
}
