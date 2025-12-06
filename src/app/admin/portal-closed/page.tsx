"use server";

import { createClient } from "@/utils/supabase/server";
import { getPeriodStatus } from "../settings/actions";
import Link from "next/link";
import { Lock, Clock, ArrowRight, CalendarX, AlertCircle } from "lucide-react";

type SearchParams = {
  source?: string; // 'nominator' or 'committee'
  reason?: string; // 'nomination' or 'scoring'
};

export default async function PortalClosedPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { source, reason } = await searchParams;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Fetch User Role (To know if they are allowed to switch context)
  let userRole = "nominator";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile) userRole = profile.role;
  }

  // 2. Fetch Live Statuses
  const nomStatus = await getPeriodStatus("nomination_period");
  const scoreStatus = await getPeriodStatus("scoring_period");

  // --- LOGIC ENGINE: Determine Message & Action ---
  
  // Defaults
  let Icon = Lock;
  let iconColor = "bg-red-50 text-red-600";
  let title = "Portal Access Restricted";
  let message = "This section of the portal is currently closed.";
  let actionButton = null;

  // SCENARIO 1: TOTALLY UNSCHEDULED
  if (nomStatus === "UNSCHEDULED" && scoreStatus === "UNSCHEDULED") {
      Icon = CalendarX;
      iconColor = "bg-gray-100 text-gray-500";
      title = "No Scheduled Period";
      message = "There is currently no active nomination or evaluation period scheduled. Please check back later for announcements from HR.";
  }
  
  // SCENARIO 2: Nomination OPEN, but Scoring CLOSED
  // (User tried to access Committee/Scoring pages)
  else if (nomStatus === "OPEN" && source === "committee") {
      Icon = Clock;
      iconColor = "bg-blue-50 text-blue-600";
      title = "Evaluation Not Started";
      message = "The committee evaluation period hasn't started yet, but nominations are currently in progress.";
      
      // Suggestion: Go nominate instead
      actionButton = (
          <div className="w-full">
              <p className="text-sm text-gray-500 mb-2 font-medium">Would you like to submit a nomination?</p>
              <Link href="/nominators/dashboard" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                 Go to Nomination Dashboard <ArrowRight size={16}/>
              </Link>
          </div>
      );
  }

  // SCENARIO 3: Nomination CLOSED, but Scoring OPEN
  // (User tried to access Nominator pages)
  else if (scoreStatus === "OPEN" && source === "nominator") {
      Icon = Lock;
      title = "Nominations Closed";
      
      if (userRole === "committee") {
          // If Committee Member: Suggest switching to Evaluation
          iconColor = "bg-purple-50 text-purple-600";
          message = "The nomination period has ended. However, the evaluation period is active.";
          actionButton = (
              <div className="w-full">
                  <p className="text-sm text-gray-500 mb-2 font-medium">Continue to evaluation?</p>
                  <Link href="/committee/review-dashboard" className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">
                     Go to Committee Dashboard <ArrowRight size={16}/>
                  </Link>
              </div>
          );
      } else {
          // Regular Nominator: Dead end
          message = "The nomination period has officially ended. You cannot submit new entries at this time.";
      }
  } 
  
  // SCENARIO 4: Specific Deadlines Passed (Standard Messages)
  else {
      if (reason === "nomination") {
          title = "Nominations Closed";
          message = "The nomination period is not currently active.";
      } else if (reason === "scoring") {
          Icon = Clock;
          iconColor = "bg-orange-50 text-orange-600";
          title = "Evaluation Closed";
          message = "The committee evaluation period is not currently active.";
      }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full flex flex-col items-center">
        
        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${iconColor}`}>
          <Icon size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>

        <div className="space-y-4 w-full">
          {/* Smart Action Button (if any) */}
          {actionButton}
          
          {/* Default Escape Hatch */}
          <Link href="/" className="block w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}