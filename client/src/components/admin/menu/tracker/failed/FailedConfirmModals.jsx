import React from "react";
import { createPortal } from "react-dom";
import { IoTrashOutline, IoWarningOutline } from "react-icons/io5";

export default function FailedConfirmModals({
  deleteTarget,
  onCloseDelete,
  onConfirmDelete,
  deleting,
  clearModalOpen,
  onCloseClear,
  onConfirmClear,
  clearing,
  failedTotal = 0,
}) {
  return (
    <>
      {/* ── Single Delete Confirmation Modal ──────────────────────────── */}
      {deleteTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            onClick={onCloseDelete}
          >
            <div
              className="bg-white rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-scaleUp text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
                <IoTrashOutline />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Failed Login Record?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete the attempt record for{" "}
                  <strong className="text-gray-800">{deleteTarget.identifier}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onCloseDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ── Clear All Confirmation Modal ──────────────────────────────── */}
      {clearModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            onClick={onCloseClear}
          >
            <div
              className="bg-white rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-scaleUp text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
                <IoWarningOutline />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Clear All Failed Logins?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  This will permanently clear all{" "}
                  <strong className="text-rose-600">{failedTotal}</strong> recorded failed login attempt logs from the database.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onCloseClear}
                  disabled={clearing}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmClear}
                  disabled={clearing}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  {clearing ? "Clearing..." : "Clear All Logs"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
