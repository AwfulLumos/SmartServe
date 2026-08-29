import { useRef } from "react";
import { IoShieldCheckmarkOutline, IoCameraOutline } from "react-icons/io5";
import { resolveProfileImageUrl } from "./AccountConstants";

export default function AccountHeroCard({ user, initials, uploading, onImageChange }) {
  const fileInputRef = useRef(null);

  const profileImage = resolveProfileImageUrl(user?.profileImageUrl || "");

  const handlePickImage = () => fileInputRef.current?.click();

  return (
    <section className="relative overflow-hidden bg-[#6c944d] rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="absolute -left-16 -top-10 w-72 h-72 rounded-full bg-black/10 pointer-events-none" />
      <div className="absolute -right-20 -top-12 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[#e8f5be] shadow-xl overflow-hidden border border-white/30 flex items-center justify-center text-[#4a6741] font-bold text-2xl flex-shrink-0">
          {profileImage ? (
            <img src={profileImage} alt={user?.fullName || "User"} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="text-white flex-1 min-w-0">
          <p className="text-2xl font-bold truncate">{user?.fullName || "Admin"}</p>
          <p className="text-white/90 text-sm mt-0.5">@{user?.username || "admin"}</p>
          <span className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full border border-white/35 bg-white/15 text-white text-xs font-medium">
            <IoShieldCheckmarkOutline />
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Admin"}
          </span>
        </div>

        <div className="sm:self-start">
          <button
            onClick={handlePickImage}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-[#4a6741] hover:bg-[#f0f7ec] text-xs font-semibold transition disabled:opacity-70 cursor-pointer shadow-sm"
          >
            <IoCameraOutline />
            {uploading ? "Uploading..." : "Update Photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />
        </div>
      </div>
    </section>
  );
}
