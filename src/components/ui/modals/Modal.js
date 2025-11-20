export default function Modal({ open, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-2xl shadow-2xl px-3 py-5 w-[96vw] max-w-lg sm:px-6 sm:py-7 sm:max-w-xl md:max-w-2xl">
        <button className="absolute top-4 right-4 text-2xl px-2 rounded hover:bg-gray-100" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
