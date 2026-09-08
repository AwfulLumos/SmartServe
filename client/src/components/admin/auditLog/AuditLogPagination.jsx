import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

export default function AuditLogPagination({
  page,
  pages,
  total,
  setPage,
}) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-gray-400">
        Page {page} of {pages} &middot; {total} entries
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-[#4a6741]/40 transition cursor-pointer"
        >
          <IoChevronBackOutline />
        </button>
        {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
          const p = page <= 4 ? i + 1 : page - 3 + i;
          if (p < 1 || p > pages) return null;
          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition border cursor-pointer ${
                p === page
                  ? "bg-[#4a6741] text-white border-[#4a6741]"
                  : "border-gray-200 text-gray-600 hover:border-[#4a6741]/40"
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-[#4a6741]/40 transition cursor-pointer"
        >
          <IoChevronForwardOutline />
        </button>
      </div>
    </div>
  );
}
