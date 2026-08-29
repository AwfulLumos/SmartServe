import { IoPulseOutline } from "react-icons/io5";
import { fmtTime } from "./AccountConstants";

export default function AccountActivityCard({ user }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-[#4a6741] flex items-center gap-2">
          <IoPulseOutline />
          Activity Summary
        </h3>
        <p className="text-sm text-gray-500 mt-1">Your recent activity overview</p>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Last Login</p>
          <p className="text-[#4a6741] text-2xl font-bold mt-1">{user?.lastLoginAt ? "Today" : "Not set"}</p>
          <p className="text-sm text-gray-500 mt-1">{fmtTime(user?.lastLoginAt)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Sessions This Week</p>
          <p className="text-[#4a6741] text-2xl font-bold mt-1">{user?.loginCount ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Across all devices</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Account Status</p>
          <p className="text-green-600 text-2xl font-bold mt-1">Active</p>
        </div>
      </div>
    </section>
  );
}
