import Header from "@/components/header";

export default function RegisterSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-8">
      <section className="w-full max-w-[566px] border-0 bg-white rounded-[10px] shadow-[0_0_11px_0_rgba(0,0,0,0.30)] overflow-hidden">
       {/* Header */}
        <div className="h-auto">
          <Header variant="login" />
        </div>

        <div className="flex justify-center border-b border-gray-200">
          <div className="py-3.5 px-8 text-center text-[20px] sm:text-[21px] tracking-[-0.208px] text-[#8A1538] border-b-[2px] border-[#8A1538] font-medium">
            Register
          </div>
        </div>

        <div className="px-6 sm:px-12 py-10 sm:py-16 text-center">
          <p className="text-black text-[22px] leading-normal tracking-[-0.22px] mb-8">
            Thank you for registering. If approved, your login credentials will
            be sent to your official UP email address.
          </p>
          <p className="text-black text-[22px] leading-normal tracking-[-0.22px]">
            Please contact HR for any issues with registration.
          </p>
        </div>
      </section>
    </div>
  );
}
