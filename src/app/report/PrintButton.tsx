"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 print:hidden"
    >
      Print Report
    </button>
  );
}
