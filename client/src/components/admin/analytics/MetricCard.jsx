export default function MetricCard({ label, value, note, icon, tone = "green" }) {
  const toneClasses = {
    green: "bg-[#e8f5e2] text-[#4a6741]",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-800">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneClasses[tone] || toneClasses.green}`}>
          {icon}
        </div>
      </div>
      {note && <p className="mt-3 text-xs text-gray-400">{note}</p>}
    </div>
  );
}
