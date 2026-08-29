import { IoSaveOutline } from "react-icons/io5";

export default function AccountEditForm({ form, setForm, saving, onSave }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-[#4a6741]">Edit Account</h3>
      </div>
      <form onSubmit={onSave} className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
          Full Name
          <input
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
          Username
          <input
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
            required
          />
        </label>

        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4a6741] text-white hover:bg-[#3a5333] text-sm transition font-semibold disabled:opacity-70 cursor-pointer"
          >
            <IoSaveOutline />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
