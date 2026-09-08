/**
 * Shared background layout for all student-facing pages.
 * Light green background (#d7ecc8) with decorative blurred circles, matching the design.
 */
export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#d7ecc8] flex flex-col items-center justify-center px-5 py-10">
      {/* Decorative circles */}
      <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-[#b8dba0] opacity-70" />
      <div className="absolute -top-8 right-4 w-36 h-36 rounded-full bg-[#b8dba0] opacity-60" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#b8dba0] opacity-70" />
      <div className="absolute bottom-8 -right-16 w-40 h-40 rounded-full bg-[#b8dba0] opacity-60" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
