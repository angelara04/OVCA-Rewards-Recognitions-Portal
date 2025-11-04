export default function RegisterSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <section className="w-full max-w-[566px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Header with branding */}
        <div className="">
          <img src="../login-header.png" alt="Branding" />
        </div>

        {/* Tab Section */}
        <div className="flex justify-center pt-8">
          <div className="text-center pb-3 border-b-2 border-[var(--maroon)] w-[40%]">
            <span className="text-[var(--maroon)] font-semibold text-lg">
              Register
            </span>
          </div>
        </div>

        {/* Success Message */}
        <div className="px-6 sm:px-12 py-10 sm:py-16 text-center">
          <p className="text-gray-900 text-base sm:text-lg leading-relaxed tracking-normal mb-6">
            Thank you for registering. If approved, your login credentials will be sent to your official UP email
            address.
          </p>
          <p className="text-gray-900 text-base font-semibold sm:text-lg leading-relaxed tracking-normal">
            Please contact HR for any issues with registration.
          </p>
        </div>
      </section>
    </div>
  )
}
