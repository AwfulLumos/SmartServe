import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../../utils/api";

import { CATEGORY_LABELS } from "../auditLog/AuditLogConstants";
import AuditLogHeader from "../auditLog/AuditLogHeader";
import AuditLogFilterBar from "../auditLog/AuditLogFilterBar";
import AuditLogTable from "../auditLog/AuditLogTable";
import AuditLogPagination from "../auditLog/AuditLogPagination";
import AuditLogDeleteModal from "../auditLog/AuditLogDeleteModal";
import AuditLogClearModal from "../auditLog/AuditLogClearModal";

export default function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [actorType, setActorType] = useState("all");
  const [page, setPage] = useState(1);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const LIMIT = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(search && { search }),
        ...(category !== "all" && { category }),
        ...(actorType !== "all" && { actorType }),
      });
      const res = await api.get(`/audit-logs?${params}`);
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setLogs([]);
    }
    setLoading(false);
  }, [search, category, actorType, page]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        all: "true",
        ...(search && { search }),
        ...(category !== "all" && { category }),
        ...(actorType !== "all" && { actorType }),
      });
      const res = await api.get(`/audit-logs?${params}`);
      const exportLogs = res.data?.logs && res.data.logs.length > 0 ? res.data.logs : logs;

      if (!exportLogs || exportLogs.length === 0) {
        toast.error("No audit logs available to export.");
        setExporting(false);
        return;
      }

      const headers = ["Timestamp", "Action", "Category", "Actor Type", "Actor Name", "Description"];
      const rows = exportLogs.map((log) => [
        `"${new Date(log.createdAt).toLocaleString("en-US")}"`,
        `"${(log.action || "").replace(/"/g, '""')}"`,
        `"${(CATEGORY_LABELS[log.category] || log.category || "").replace(/"/g, '""')}"`,
        `"${(log.actorType || "").replace(/"/g, '""')}"`,
        `"${(log.actorName || "").replace(/"/g, '""')}"`,
        `"${(log.description || "").replace(/"/g, '""')}"`,
      ]);

      const csvString = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `smartserve_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported all ${exportLogs.length} audit log entries to CSV`);
    } catch {
      toast.error("Failed to export audit logs");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/audit-logs/${deleteTarget._id}`);
      toast.success("Audit log entry deleted");
      setDeleteTarget(null);
      fetchLogs();
    } catch {
      toast.error("Failed to delete audit log entry");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      const params = new URLSearchParams({
        ...(category !== "all" && { category }),
        ...(actorType !== "all" && { actorType }),
      });
      const res = await api.delete(`/audit-logs/clear-all?${params}`);
      toast.success(res.data?.message || "Audit logs cleared");
      setClearModalOpen(false);
      fetchLogs();
    } catch {
      toast.error("Failed to clear audit logs");
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, category, actorType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      {/* Header */}
      <AuditLogHeader
        total={total}
        exporting={exporting}
        onExportCSV={handleExportCSV}
        onOpenClearModal={() => setClearModalOpen(true)}
      />

      {/* Filter Bar */}
      <AuditLogFilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        actorType={actorType}
        setActorType={setActorType}
        loading={loading}
        onRefresh={fetchLogs}
      />

      {/* Table */}
      <AuditLogTable
        logs={logs}
        loading={loading}
        onSetDeleteTarget={setDeleteTarget}
      />

      {/* Pagination */}
      <AuditLogPagination
        page={page}
        pages={pages}
        total={total}
        setPage={setPage}
      />

      {/* Delete Single Entry Modal */}
      <AuditLogDeleteModal
        deleteTarget={deleteTarget}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirmDelete={handleDeleteSingle}
      />

      {/* Clear Logs Modal */}
      <AuditLogClearModal
        clearModalOpen={clearModalOpen}
        category={category}
        actorType={actorType}
        clearing={clearing}
        onClose={() => setClearModalOpen(false)}
        onConfirmClear={handleClearLogs}
      />
    </div>
  );
}
