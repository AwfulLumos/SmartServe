import { IoTrashOutline, IoLogOutOutline } from "react-icons/io5";

export default function AccountFooterActions({
  deleting,
  onDeleteAccount,
  onLogout,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
      <button
        type="button"
        onClick={onDeleteAccount}
        disabled={deleting}
        className="w-full sm:flex-1 h-12 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-semibold transition disabled:opacity-70 cursor-pointer"
      >
        <IoTrashOutline className="text-base" />
        <span>{deleting ? "Deleting account..." : "Delete My Account"}</span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onLogout();
        }}
        className="w-full sm:flex-1 h-12 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-semibold transition cursor-pointer"
      >
        <IoLogOutOutline className="text-base" />
        <span>Logout</span>
      </button>
    </div>
  );
}
