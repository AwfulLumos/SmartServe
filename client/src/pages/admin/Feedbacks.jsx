import { useState, useEffect, useCallback } from "react";
import { IoChatbubblesOutline } from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { SkeletonList } from "../../components/SkeletonLoader";

import FeedbacksHeader from "../../components/admin/feedbacks/FeedbacksHeader";
import FeedbacksKpiGrid from "../../components/admin/feedbacks/FeedbacksKpiGrid";
import FeedbacksFilterBar from "../../components/admin/feedbacks/FeedbacksFilterBar";
import FeedbackCard from "../../components/admin/feedbacks/FeedbackCard";
import FeedbackReplyModal from "../../components/admin/feedbacks/FeedbackReplyModal";
import FeedbackDeleteModal from "../../components/admin/feedbacks/FeedbackDeleteModal";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewed: 0, resolved: 0, averageRating: 5.0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reply Modal State
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(category !== "all" && { category }),
        ...(status !== "all" && { status }),
        ...(rating !== "all" && { rating }),
      });

      const { data } = await api.get(`/feedback?${params}`);
      setFeedbacks(data.feedbacks || []);
      setStats(data.stats || { total: 0, pending: 0, reviewed: 0, resolved: 0, averageRating: 5.0 });
      setTotalPages(data.pages || 1);
    } catch {
      toast.error("Failed to load feedbacks.");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, status, rating]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Handle status toggle
  const handleUpdateStatus = async (item, newStatus) => {
    try {
      await api.patch(`/feedback/${item._id}/status`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchFeedbacks();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  // Open Reply Modal
  const openReplyModal = (item) => {
    setReplyTarget(item);
    setReplyText(item.adminResponse || "");
  };

  // Submit Reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await api.patch(`/feedback/${replyTarget._id}/status`, {
        adminResponse: replyText.trim(),
        status: replyTarget.status === "pending" ? "reviewed" : replyTarget.status,
      });
      toast.success("Admin response posted successfully!");
      setReplyTarget(null);
      setReplyText("");
      fetchFeedbacks();
    } catch {
      toast.error("Failed to post response.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/feedback/${deleteTarget._id}`);
      toast.success("Feedback deleted.");
      setDeleteTarget(null);
      fetchFeedbacks();
    } catch {
      toast.error("Failed to delete feedback.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout breadcrumb="Feedbacks">
      {/* Header */}
      <FeedbacksHeader onRefresh={fetchFeedbacks} loading={loading} />

      {/* KPI Stats Grid */}
      <FeedbacksKpiGrid stats={stats} />

      {/* Search & Filters Controls */}
      <FeedbacksFilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        rating={rating}
        setRating={setRating}
        status={status}
        setStatus={setStatus}
      />

      {/* Feedback List */}
      {loading ? (
        <SkeletonList count={4} />
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          <IoChatbubblesOutline className="text-5xl mx-auto mb-3 text-gray-300" />
          <p className="text-base font-semibold text-gray-700">No feedbacks found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item) => (
            <FeedbackCard
              key={item._id}
              item={item}
              onUpdateStatus={handleUpdateStatus}
              onOpenReply={openReplyModal}
              onSetDeleteTarget={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Reply Modal */}
      <FeedbackReplyModal
        replyTarget={replyTarget}
        replyText={replyText}
        setReplyText={setReplyText}
        submittingReply={submittingReply}
        onClose={() => setReplyTarget(null)}
        onSubmitReply={handleSendReply}
      />

      {/* Delete Confirm Modal */}
      <FeedbackDeleteModal
        deleteTarget={deleteTarget}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirmDelete={handleDeleteConfirm}
      />
    </AdminLayout>
  );
}
