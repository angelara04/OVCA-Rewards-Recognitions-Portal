"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type PeriodSetting = {
  setting_key: string;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
};

export type PeriodStatus = "OPEN" | "CLOSED" | "UNSCHEDULED";

export async function getPortalSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portal_settings")
    .select("*")
    .order("setting_key");
  
  if (error) {
    console.error("Error fetching settings:", error);
    return {};
  }

  const settingsMap: Record<string, PeriodSetting> = {};
  data.forEach((item) => {
    settingsMap[item.setting_key] = item;
  });

  return settingsMap;
}

// Bulk Save (For the main Save button)
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
        start_at: formatForDB(nomStart), 
        end_at: formatForDB(nomEnd),
        updated_at: new Date().toISOString()
      }).eq("setting_key", "nomination_period"),

      supabase.from("portal_settings").update({ 
        start_at: formatForDB(scoreStart), 
        end_at: formatForDB(scoreEnd),
        updated_at: new Date().toISOString()
      }).eq("setting_key", "scoring_period")
    ]);

    revalidatePath("/admin/settings");
    return { success: true, message: "All timeline settings updated successfully." };

  } catch (error) {
    return { success: false, message: "Failed to update settings." };
  }
}

// --- 🔥 NEW: IMMEDIATE CLEAR ACTION ---
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

// Logic Engine
export async function getPeriodStatus(key: "nomination_period" | "scoring_period"): Promise<PeriodStatus> {
  const supabase = await createClient();
  const { data } = await supabase.from("portal_settings").select("start_at, end_at, is_active").eq("setting_key", key).single();

  if (!data || !data.is_active || !data.start_at || !data.end_at) return "UNSCHEDULED";

  const now = new Date();
  const start = new Date(data.start_at);
  const end = new Date(data.end_at);
  
  const gracePeriodEnd = new Date(end);
  gracePeriodEnd.setDate(end.getDate() + 1);

  if (now >= start && now <= end) return "OPEN";
  else if (now > end && now <= gracePeriodEnd) return "CLOSED";
  else return "UNSCHEDULED";
}