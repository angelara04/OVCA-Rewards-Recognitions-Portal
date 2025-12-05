"use server";

import { createClient } from "@/utils/supabase/server";

// --- 🔥 FIX: Update this Type Definition to match the new structure ---
export type UserProfile = {
  name: string;
  email: string;
  role: string;
  department: string;
  memberSince: string;
  lastLogin: string;
  
  // New fields
  isCommittee: boolean; 
  stats: {
    reviewsCompleted: number;
    reviewsPending: number;
    nominationsCompleted: number;
    nominationsPending: number;
  };
};

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, department, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  // 2. Fetch Stats in Parallel
  const [
    completedReviews, 
    pendingReviews, 
    completedNoms, 
    pendingNoms
  ] = await Promise.all([
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("reviewer_id", user.id).eq("status", "completed"),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("reviewer_id", user.id).neq("status", "completed"),
    supabase.from("nominations").select("*", { count: "exact", head: true }).eq("created_by", user.id).eq("status", "completed"),
    supabase.from("nominations").select("*", { count: "exact", head: true }).eq("created_by", user.id).neq("status", "completed"),
  ]);

  // 3. Format Date
  const joinDate = profile.created_at || new Date().toISOString();
  const memberSince = new Date(joinDate).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  
  const lastLogin = user.last_sign_in_at || new Date().toISOString();

  // 4. Return Data matching the Type Definition above
  return {
    name: profile.name || "Unknown User",
    email: user.email || "",
    role: profile.role || "Nominator",
    department: profile.department || "Unassigned",
    memberSince,
    lastLogin,
    isCommittee: profile.role === "committee",
    stats: {
      reviewsCompleted: completedReviews.count || 0,
      reviewsPending: pendingReviews.count || 0,
      nominationsCompleted: completedNoms.count || 0,
      nominationsPending: pendingNoms.count || 0,
    }
  };
}