import api from "./api";
import studentApi from "./studentApi";

// In-memory module cache
let cachedStudentMenu = null;
let cachedAdminMenu = null;

const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeMenuCache = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getCachedStudentMenu = () => cachedStudentMenu;
export const getCachedAdminMenu = () => cachedAdminMenu;

export const fetchStudentMenuSWR = async (onData, onLoading) => {
  if (cachedStudentMenu) {
    onData(cachedStudentMenu);
    if (onLoading) onLoading(false);
  } else {
    if (onLoading) onLoading(true);
  }

  try {
    const res = await studentApi.get("/menu/active");
    const freshData = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
    cachedStudentMenu = freshData;
    onData(freshData);
    notifyListeners();
  } catch (err) {
    if (!cachedStudentMenu) {
      onData([]);
    }
  } finally {
    if (onLoading) onLoading(false);
  }
};

export const fetchAdminMenuSWR = async (onData, onLoading) => {
  if (cachedAdminMenu) {
    onData(cachedAdminMenu);
    if (onLoading) onLoading(false);
  } else {
    if (onLoading) onLoading(true);
  }

  try {
    const res = await api.get("/menu");
    const freshData = Array.isArray(res.data) ? res.data : [];
    cachedAdminMenu = freshData;
    onData(freshData);
    notifyListeners();
  } catch (err) {
    if (!cachedAdminMenu) {
      onData([]);
    }
  } finally {
    if (onLoading) onLoading(false);
  }
};

export const invalidateClientMenuCache = () => {
  cachedStudentMenu = null;
  cachedAdminMenu = null;
  notifyListeners();
};
