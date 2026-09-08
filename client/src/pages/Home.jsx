import { useState, useEffect } from "react";
import { IoRocketOutline, IoLogoGithub, IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5";
import api from "../utils/api";

function Home() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <IoRocketOutline className="text-6xl text-indigo-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">MERN Boilerplate</h1>
        <p className="text-gray-500 mb-6">
          MongoDB &bull; Express &bull; React &bull; Node.js
        </p>

        {/* Server Status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {loading ? (
            <span className="text-gray-400">Checking server...</span>
          ) : status ? (
            <>
              <IoCheckmarkCircle className="text-green-500 text-xl" />
              <span className="text-green-600 font-medium">Server connected</span>
            </>
          ) : (
            <>
              <IoAlertCircle className="text-red-500 text-xl" />
              <span className="text-red-500 font-medium">Server offline</span>
            </>
          )}
        </div>

        {/* Stack Info */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="bg-gray-100 rounded-lg p-3">Tailwind CSS</div>
          <div className="bg-gray-100 rounded-lg p-3">Axios</div>
          <div className="bg-gray-100 rounded-lg p-3">Ionicons</div>
          <div className="bg-gray-100 rounded-lg p-3">React Router</div>
        </div>
      </div>

      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center gap-2 text-gray-400 hover:text-gray-600 transition"
      >
        <IoLogoGithub className="text-xl" />
        <span className="text-sm">MERN Boilerplate</span>
      </a>
    </div>
  );
}

export default Home;
