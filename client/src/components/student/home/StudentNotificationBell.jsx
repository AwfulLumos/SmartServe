import React, { useState, useEffect, useRef } from "react";
import { useNotifications } from "../../../context/NotificationContext";
import {
  IoNotificationsOutline,
  IoReceiptOutline,
  IoLeafOutline,
  IoGiftOutline,
  IoCheckmarkDoneOutline,
} from "react-icons/io5";

const STUDENT_NOTIF_CONFIG = {
  order_placed: { icon: <IoReceiptOutline />, color: "bg-blue-100 text-blue-600" },
  order_status: { icon: <IoReceiptOutline />, color: "bg-yellow-100 text-yellow-600" },
  byoc_awarded: { icon: <IoLeafOutline />, color: "bg-[#d7ecc8] text-[#4a6741]" },
  reward_redeemed: { icon: <IoGiftOutline />, color: "bg-purple-100 text-purple-600" },
};

function timeAgoShort(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function StudentNotificationBell() {
  const { notifications, unread, markAllRead, markOneRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative font-sans" ref={ref}>
      <button
        onClick={() => {
          const opening = !open;
          setOpen(opening);
          if (opening && unread > 0) markAllRead();
        }}
        className="relative p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2e4028] transition"
      >
        <IoNotificationsOutline className="text-2xl text-gray-500 dark:text-gray-300" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold px-0.5">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-72 bg-white dark:bg-[#1a2416] rounded-2xl shadow-xl border border-gray-100 dark:border-[#2b3924] z-50 overflow-hidden font-sans">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2b3924]">
            <p className="font-bold text-sm text-gray-800 dark:text-gray-100">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-[#4a6741] dark:text-[#8ebd7e] font-semibold hover:underline"
              >
                <IoCheckmarkDoneOutline className="text-base" />
                All read
              </button>
            )}
          </div>
          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-[#2b3924]">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-400 dark:text-gray-400 text-sm">No notifications yet</li>
            ) : (
              notifications.map((n) => {
                const cfg = STUDENT_NOTIF_CONFIG[n.type] || {
                  icon: <IoNotificationsOutline />,
                  color: "bg-gray-100 dark:bg-[#2e4028] text-gray-500 dark:text-gray-300",
                };
                return (
                  <li
                    key={n._id}
                    onClick={() => !n.read && markOneRead(n._id)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#24301f] transition ${
                      !n.read ? "bg-[#f0f7ec] dark:bg-[#2e4028]/60" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className="text-[10px] text-gray-400 dark:text-gray-400">{timeAgoShort(n.createdAt)}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#4a6741] dark:bg-[#8ebd7e]" />}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
