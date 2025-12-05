"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, Mail, Briefcase, Calendar, RefreshCw } from "lucide-react";
import { getUserProfile, type UserProfile } from "../../committee/profile/actions";

export default function NominatorProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-20 text-center text-gray-500">Loading Profile...</div>;
  if (!profile) return <div className="p-20 text-center text-red-500">User profile not found.</div>;

  // Format Date Helper
  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString("en-US", {
      month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true,
    });
  };

  const initials = profile.name ? profile.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "U";

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-6 md:p-10 bg-white">
      <div className="w-full max-w-5xl text-sm">
        
        {/* HEADER */}
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900">Profile Information</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            This page contains your registered details.
          </p>
        </div>

        {/* COLUMNS */}
        <div className="flex flex-col md:flex-row gap-12 w-full">
          
          {/* LEFT: Avatar */}
          <div className="flex flex-col items-center md:w-1/3 w-full">
            <div className="relative mb-4">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl sm:text-5xl font-bold">
                {initials}
              </div>
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-blue-900 rounded-full p-2 text-white border-2 border-white">
                <User size={16} />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
            <div className="mt-2">
                {/* Visual Label: Always "Nominator" here, or show actual role? 
                    Showing "Nominator" fits the context of this dashboard. */}
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider rounded-full">
                    Nominator
                </span>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="flex flex-col flex-1 w-full space-y-10">
            
            {/* Personal Info */}
            <div className="w-full">
              <h3 className="font-bold text-lg mb-4 text-blue-900 border-l-4 border-blue-900 pl-3">Personal Information</h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-100 py-4">
                  <div className="bg-blue-50 p-2 rounded text-blue-900 shrink-0"><User size={24} /></div>
                  <div className="flex flex-col sm:flex-row sm:items-center w-full justify-between">
                    <p className="text-gray-500 w-40">Full Name</p>
                    <p className="font-semibold text-gray-900">{profile.name}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-100 py-4">
                  <div className="bg-blue-50 p-2 rounded text-blue-900 shrink-0"><Mail size={24} /></div>
                  <div className="flex flex-col sm:flex-row sm:items-center w-full justify-between">
                    <p className="text-gray-500 w-40">Email Address</p>
                    <p className="font-semibold text-gray-900">{profile.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="w-full">
              <h3 className="font-bold text-lg mb-4 text-blue-900 border-l-4 border-blue-900 pl-3">Professional Information</h3>
              <div className="flex flex-col gap-4">
                
                {/* Role Row + Conditional Switch */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-100 py-4">
                  <div className="bg-blue-50 p-2 rounded text-blue-900 shrink-0"><Briefcase size={24} /></div>
                  <div className="flex flex-col sm:flex-row sm:items-center w-full gap-4">
                    <p className="text-gray-500 w-40 shrink-0">Role</p>
                    <div className="flex flex-1 items-center justify-between flex-wrap gap-3">
                      <p className="font-semibold text-gray-900 capitalize">{profile.role}</p>
                      
                      {/* --- SWITCH BUTTON (Only if Committee) --- */}
                      {profile.isCommittee && (
                        <Link href="/admin/committee/profile">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors border border-gray-200">
                            <RefreshCw size={14} />
                            Switch back to Committee
                            </button>
                        </Link>
                      )}
                      
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-100 py-4">
                  <div className="bg-blue-50 p-2 rounded text-blue-900 shrink-0"><Briefcase size={24} /></div>
                  <div className="flex flex-col sm:flex-row sm:items-center w-full justify-between">
                    <p className="text-gray-500 w-40">Department</p>
                    <p className="font-semibold text-gray-900 flex-1 break-words">{profile.department}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-100 py-4">
                  <div className="bg-blue-50 p-2 rounded text-blue-900 shrink-0"><Calendar size={24} /></div>
                  <div className="flex flex-col sm:flex-row sm:items-center w-full justify-between">
                    <p className="text-gray-500 w-40">Member Since</p>
                    <p className="font-semibold text-gray-900">{profile.memberSince}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- ACCOUNT ACTIVITY (Nominator Stats) --- */}
        <div className="mt-12">
          <h3 className="font-bold text-lg mb-6 text-blue-900 border-l-4 border-blue-900 pl-3">Account Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Last Login</p>
              <p className="font-bold text-gray-900 text-lg mb-1">{formatDate(profile.lastLogin)}</p>
              <p className="text-xs text-gray-400">Recent login activity</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Nominations Submitted</p>
              {/* Uses NOMINATION stats */}
              <p className="font-bold text-gray-900 text-lg mb-1">{profile.stats.nominationsCompleted}</p>
              <p className="text-xs text-gray-400">Evaluated & Closed</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Pending Nominations</p>
              {/* Uses NOMINATION stats */}
              <p className="font-bold text-gray-900 text-lg mb-1">{profile.stats.nominationsPending}</p>
              <p className="text-xs text-gray-400">In Progress</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}