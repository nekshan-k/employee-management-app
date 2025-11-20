export default function Button({ children, variant = "primary", onClick, disabled, className = "" }) {
  const base = "px-4 py-2 rounded-lg font-medium transition shadow text-center disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    red: "bg-red text-white hover:bg-red",
    primary: "bg-primary500 text-white hover:bg-primary400",
    outline: "border border-primary500 text-primary500 hover:bg-primary50"
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
