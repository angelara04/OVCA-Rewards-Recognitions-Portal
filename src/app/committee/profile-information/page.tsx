"use client";
import React, { useEffect, useState } from "react";
import Section from "@/components/section";
import Button from "@/components/button";
import Role from "@/components/greetings/role";
import { User, Mail, Briefcase, Calendar, RefreshCw } from "lucide-react";

import { getUserProfile, type UserProfile } from "@/app/admin/committee/profile/actions";
import Link  from "next/link";


export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

 if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[var(--maroon)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--dark-grey)] text-sm font-medium">Loading...</p>
      </div>
    );
  }

   if (!profile) return <div className="p-20 text-red-500">Profile not found.</div>;

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      <div className="w-full max-w-5xl text-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[var(--black)]">
            Profile Information
          </h1>
          <p className="text-[var(--dark-grey)] text-sm sm:text-base">
            This page contains your registered details. Please review and ensure
            that your profile information is accurate. For any updates, contact
            the system administrator.
          </p>
        </div>

        {/* Profile Columns */}
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Left Column */}
          <div className="flex flex-col items-center md:w-1/3 w-full">
            <div className="relative">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-4xl sm:text-5xl font-bold">
                    {profile.name[0]}{profile.name.split(" ")[1]?.[0] || ""}
                  </span>
                )}
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-[var(--maroon)] rounded-full p-2 text-white text-xs">
                  <User size={16} />
                </div>
              </div>

              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-[var(--maroon)] rounded-full p-2 text-white text-xs">
                <User size={16} />
              </div>
            </div>

            <h2 className="text-base font-semibold mt-4">{profile.name}</h2>
            <Role role={profile.role} />
          </div>

          {/* Right Column */}
          <div className="flex flex-col flex-1 w-full">
            {/* Personal Info */}
            <div className="flex-1 w-full">
              <h3 className="font-bold text-lg mb-4 text-[var(--maroon)]">
                Personal Information
              </h3>
              <div className="flex flex-col gap-4 w-full">
                {/* Name */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-[var(--outline-grey)] py-4 w-full">
                  <User
                    className="text-[var(--maroon)] bg-[var(--light-red)] rounded-[5px] p-2 shrink-0"
                    size={36}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
                    <p className="text-gray-500 w-auto lg:w-[180px]">
                      Full Name
                    </p>
                    <p className="font-semibold">{profile.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-[var(--outline-grey)] py-4 w-full">
                  <Mail
                    className="text-[var(--maroon)] bg-[var(--light-red)] rounded-[5px] p-2 shrink-0"
                    size={36}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
                    <p className="text-gray-500 w-auto lg:w-[180px]">
                      Email Address
                    </p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="flex-1 w-full mt-8">
              <h3 className="font-bold text-lg mb-4 text-[var(--maroon)]">
                Professional Information
              </h3>
              <div className="flex flex-col gap-4">
                {/* Role */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-[var(--outline-grey)] py-4">
                  <Briefcase
                    className="text-[var(--maroon)] bg-[var(--light-red)] rounded-[5px] p-2 shrink-0"
                    size={36}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
                    <p className="text-gray-500  w-auto lg:w-[180px]">Role</p>
                    <div className="flex-1 flex items-center justify-between flex-col gap-2 xl:flex-row">
                      <Role role={profile.role} />
                      <Link href="/nominators/dashboard">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs px-3 py-1 whitespace-nowrap transition transform duration-200 hover:bg-[var(--dark-grey)] hover:text-[var(--white)]"
                      >
                        <RefreshCw size={14} className="mr-1" />
                        Switch to Nominator
                      </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-[var(--outline-grey)] py-4">
                  <Briefcase
                    className="text-[var(--maroon)] bg-[var(--light-red)] rounded-[5px] p-2 shrink-0"
                    size={36}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
                    <p className="text-gray-500  w-auto lg:w-[180px]">
                      Department
                    </p>
                    <p className="font-semibold break-words">
                      {profile.department}
                    </p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-[var(--outline-grey)] py-4">
                  <Calendar
                    className="text-[var(--maroon)] bg-[var(--light-red)] rounded-[5px] p-2 shrink-0"
                    size={36}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
                    <p className="text-gray-500  w-auto lg:w-[180px]">
                      Member Since
                    </p>
                    <p className="font-semibold">{profile.memberSince}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Activity */}
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4 text-[var(--maroon)]">
            Account Activity
          </h3>
          <div className="flex flex-wrap gap-4">
            {[
              {
                label: "Last Login",
                value: profile.lastLogin,
                desc: "Recent login activity",
              },
              {
                label: "Reviews Completed",
                value: profile.stats.reviewsCompleted,
                desc: "Total reviews completed",
              },
              {
                label: "Pending Actions",
                value: profile.stats.reviewsPending,
                desc: "Awaiting your action",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex-1 min-w-[240px] border rounded-2xl p-4 border-[var(--outline-grey)]"
              >
                <div className="flex flex-col">
                  <p className="text-gray-500">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
