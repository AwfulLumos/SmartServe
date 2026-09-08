import { IoCloseOutline, IoCheckmarkCircle } from "react-icons/io5";
import { CATEGORIES, UNITS } from "./InventoryConstants";

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Input = ({ error, className = "", ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white
      ${error
        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
        : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
      } ${className}`}
  />
);

export default function InventoryModal({
  modalOpen,
  editTarget,
  form,
  formErrors,
  submitting,
  apiError,
  onClose,
  onFormChange,
  onSubmit,
}) {
  if (!modalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-[#4a6741] text-base">
              {editTarget ? "Edit Item" : "Add New Item"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {editTarget ? "Update inventory item details" : "Add an item to inventory"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {apiError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {apiError}
            </div>
          )}
          <form id="inventory-form" onSubmit={onSubmit} className="space-y-4">
            {/* Name */}
            <Field label="Item Name" required error={formErrors.name}>
              <Input
                name="name"
                value={form.name}
                onChange={onFormChange}
                placeholder="e.g. Chicken Breast"
                error={formErrors.name}
              />
            </Field>

            {/* Category */}
            <Field label="Category" required error={formErrors.category}>
              <select
                name="category"
                value={form.category}
                onChange={onFormChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white
                  ${formErrors.category
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
                  }`}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            {/* Quantity + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity" required error={formErrors.quantity}>
                <Input
                  type="number"
                  min="0"
                  name="quantity"
                  value={form.quantity}
                  onChange={onFormChange}
                  placeholder="0"
                  error={formErrors.quantity}
                />
              </Field>
              <Field label="Unit" required error={formErrors.unit}>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Min Threshold */}
            <Field label="Min Threshold" required error={formErrors.minThreshold}>
              <Input
                type="number"
                min="0"
                name="minThreshold"
                value={form.minThreshold}
                onChange={onFormChange}
                placeholder="e.g. 10 — triggers Low Stock warning"
                error={formErrors.minThreshold}
              />
            </Field>

            {/* Price */}
            <Field label="Price (₱)" required error={formErrors.price}>
              <Input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={onFormChange}
                placeholder="0.00"
                error={formErrors.price}
              />
            </Field>
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="submit"
            form="inventory-form"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60 cursor-pointer"
          >
            <IoCheckmarkCircle className="text-base" />
            {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add Item"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
