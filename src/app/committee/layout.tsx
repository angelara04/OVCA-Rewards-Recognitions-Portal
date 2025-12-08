import Header from "@/components/header";
import Sidebar from "@/components/sidebar/sidebar";
import Greeting from "@/components/greetings/greeting";
import { createClient } from "@/utils/supabase/server";

export default async function CommitteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = "committee";

  // fetch authenticated user's profile on the server and pass name to Greeting
  let Fname = "Your Name";

 
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profile?.name) Fname = profile.name;
    }


  return (
    <div className="flex flex-col w-full h-full min-h-screen">
      {/* Header */}
      <div className="h-auto">
        <Header />
      </div>

      {/* Greeting - now receives the logged-in user's name */}
      <Greeting Fname={Fname} role={role} />

      {/* Sidebar + Main content */}
      <div className="flex flex-row w-full h-full gap-2 p-5">
        <Sidebar role={role} />
        <div className="flex-1 min-w-0 h-full">{children}</div>
      </div>
    </div>
  );
}