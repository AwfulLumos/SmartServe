import { useState, useEffect, useCallback, useRef } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import InventoryHeader from "../../components/admin/inventory/InventoryHeader";
import InventoryStatsSummary from "../../components/admin/inventory/InventoryStatsSummary";
import InventoryFilterBar from "../../components/admin/inventory/InventoryFilterBar";
import InventoryTable from "../../components/admin/inventory/InventoryTable";
import InventoryModal from "../../components/admin/inventory/InventoryModal";
import InventoryDeleteModal from "../../components/admin/inventory/InventoryDeleteModal";
import { emptyForm } from "../../components/admin/inventory/InventoryConstants";

export default function Inventory() {
  // Main data states
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [loading, setLoading] = useState(true);

  // Filter & search states
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Inline quantity edit state
  const [editingQtyId, setEditingQtyId] = useState(null);
  const [qtyDraft, setQtyDraft] = useState("");
  const qtyInputRef = useRef(null);

  // Modal & form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch inventory with filters
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search };
      if (activeFilter !== "all") params.status = activeFilter;
      const { data } = await api.get("/inventory", { params });
      setItems(data.items);
      setSummary(data.summary);
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  // Auto-fetch with debounce
  useEffect(() => {
    const t = setTimeout(fetchItems, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchItems]);

  // Start inline edit
  const startEditQty = (item) => {
    setEditingQtyId(item._id);
    setQtyDraft(String(item.quantity));
    setTimeout(() => qtyInputRef.current?.select(), 50);
  };

  // Save qty change
  const commitQty = async (item) => {
    const val = parseFloat(qtyDraft);
    if (isNaN(val) || val < 0) { setEditingQtyId(null); return; }
    if (val === item.quantity) { setEditingQtyId(null); return; }
    try {
      const { data } = await api.patch(`/inventory/${item._id}/quantity`, { quantity: val });
      setItems((prev) => prev.map((i) => (i._id === data._id ? data : i)));
      fetchItems();
    } catch {
      // silently revert
    } finally {
      setEditingQtyId(null);
    }
  };

  // Open add modal
  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormErrors({});
    setApiError("");
    setModalOpen(true);
  };

  // Open edit modal
  const openEdit = (item) => {
    setEditTarget(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      minThreshold: String(item.minThreshold),
      price: String(item.price),
    });
    setFormErrors({});
    setApiError("");
    setModalOpen(true);
  };

  // Close modal & reset
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm(emptyForm);
    setFormErrors({});
    setApiError("");
  };

  // Update form & clear error
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  // Validate all fields
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.category.trim()) e.category = "Required";
    if (form.quantity === "" || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) e.quantity = "Valid number ≥ 0";
    if (!form.unit.trim()) e.unit = "Required";
    if (form.minThreshold === "" || isNaN(Number(form.minThreshold)) || Number(form.minThreshold) < 0) e.minThreshold = "Valid number ≥ 0";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = "Valid number ≥ 0";
    return e;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        quantity: Number(form.quantity),
        unit: form.unit.trim(),
        minThreshold: Number(form.minThreshold),
        price: Number(form.price),
      };
      if (editTarget) {
        await api.put(`/inventory/${editTarget._id}`, payload);
      } else {
        await api.post("/inventory", payload);
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to save item.");
    } finally {
      setSubmitting(false);
    }
  };

  // Execute deletion
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/inventory/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchItems();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout breadcrumb="Inventory">
      <InventoryHeader onOpenAdd={openAdd} />
      <InventoryStatsSummary summary={summary} />
      <InventoryFilterBar
        search={search}
        onSearchChange={setSearch}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onRefresh={fetchItems}
        loading={loading}
      />
      <InventoryTable
        items={items}
        loading={loading}
        search={search}
        editingQtyId={editingQtyId}
        qtyDraft={qtyDraft}
        qtyInputRef={qtyInputRef}
        onStartEditQty={startEditQty}
        onQtyDraftChange={setQtyDraft}
        onCommitQty={commitQty}
        onCancelEditQty={() => setEditingQtyId(null)}
        onOpenEdit={openEdit}
        onConfirmDelete={setDeleteTarget}
      />
      <InventoryModal
        modalOpen={modalOpen}
        editTarget={editTarget}
        form={form}
        formErrors={formErrors}
        submitting={submitting}
        apiError={apiError}
        onClose={closeModal}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
      />
      <InventoryDeleteModal
        deleteTarget={deleteTarget}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
}