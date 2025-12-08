"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type PeriodSetting = {
  setting_key: string;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
};

export type PortalData = {
  settings: Record<string, PeriodSetting>;
  nominationCount: number;
  reviewCount: number;
};

export type PeriodStatus = "OPEN" | "CLOSED" | "UNSCHEDULED"; 

export async function getPortalData(): Promise<PortalData> {
  const supabase = await createClient();
  
  const [settingsRes, nomRes, reviewRes] = await Promise.all([
    supabase.from("portal_settings").select("*"),
    supabase.from("nominations").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
  ]);

  const settingsMap: Record<string, PeriodSetting> = {};
  settingsRes.data?.forEach((item) => {
    settingsMap[item.setting_key] = item;
  });

  return {
    settings: settingsMap,
    nominationCount: nomRes.count || 0,
    reviewCount: reviewRes.count || 0,
  };
}

export async function saveAllSettings(formData: FormData) {
  const supabase = await createClient();
  const nomStart = formData.get("nom_start") as string;
  const nomEnd = formData.get("nom_end") as string;
  const scoreStart = formData.get("score_start") as string;
  const scoreEnd = formData.get("score_end") as string;

  const formatForDB = (val: string) => val ? new Date(val).toISOString() : null;

  try {
    await Promise.all([
      supabase.from("portal_settings").update({ 
        start_at: formatForDB(nomStart), end_at: formatForDB(nomEnd), updated_at: new Date().toISOString()
      }).eq("setting_key", "nomination_period"),

      supabase.from("portal_settings").update({ 
        start_at: formatForDB(scoreStart), end_at: formatForDB(scoreEnd), updated_at: new Date().toISOString()
      }).eq("setting_key", "scoring_period")
    ]);
    revalidatePath("/admin/settings");
    return { success: true, message: "Timeline updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update settings." };
  }
}

// --- 🔥 NEW: MASTER RESET ACTION ---
export async function resetEntireCycle() {
  const supabase = await createClient();

  try {
    await supabase.from("nominations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. Clear Dates
    await supabase.from("portal_settings")
      .update({ start_at: null, end_at: null })
      .in("setting_key", ["nomination_period", "scoring_period"]);

    revalidatePath("/admin/settings");
    return { success: true, message: "System Reset: All data wiped and timeline cleared." };
  } catch (error: any) {
    return { success: false, message: "Reset failed: " + error.message };
  }
}

// Keep individual reset if needed internally, or for other uses
export async function resetPortal(type: "nomination_period" | "scoring_period") {
  // ... (Same as before, logic covered by resetEntireCycle now)
}

export async function getPeriodStatus(key: string): Promise<PeriodStatus> {
  const supabase = await createClient();
  const { data } = await supabase.from("portal_settings").select("start_at, end_at, is_active").eq("setting_key", key).single();

  if (!data || !data.is_active || !data.start_at || !data.end_at) {
    return "UNSCHEDULED";
  }

  const now = new Date();
  const start = new Date(data.start_at);
  const end = new Date(data.end_at);

  if (now >= start && now <= end) return "OPEN";
  else return "CLOSED";
}

export async function clearPeriod(key: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("portal_settings")
    .update({ 
      start_at: null, 
      end_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("setting_key", key);

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/settings");
  return { success: true, message: "Period unscheduled successfully." };
}