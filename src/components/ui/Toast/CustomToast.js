import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CustomToast() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={3000}
      hideProgressBar
      closeOnClick
      pauseOnHover
      transition={Slide}
      newestOnTop={true}
      toastClassName="bg-white text-black rounded-lg shadow px-3 py-2 flex items-center border border-neutral50"
      bodyClassName="text-sm font-medium flex items-center gap-4 pr-2"
      style={{ left: "50%", transform: "translateX(-50%)" }}
      toastStyle={{ display: "flex", alignItems: "center", width: "auto", maxWidth: "90vw" }}
      closeButton={({ closeToast }) => (
        <button
          onClick={closeToast}
          className="text-neutral500 hover:text-neutral600 ml-2 text-base"
        >
          ✕
        </button>
      )}
    />
  );
}
