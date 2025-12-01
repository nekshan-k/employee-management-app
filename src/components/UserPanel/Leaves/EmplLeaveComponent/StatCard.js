const StatCard = ({ title, badge, available, booked }) => (
  <div className="bg-white border border-borderGray200 rounded-2xl shadow-md px-5 py-6 flex flex-col gap-3 min-h-[130px]">
    <div className="flex justify-between items-center">
      <div className="text-sm text-neutral400 font-nunito">{title}</div>
      {badge && (
        <span className="h-7 w-7 rounded-xl bg-secondary100 flex items-center justify-center text-secondary600 font-bold">{badge}</span>
      )}
    </div>
    <div className="flex justify-between gap-3 pt-2">
      <div>
        <div className="text-xs text-neutral300">Available</div>
        <div className="text-primary600 font-bold">{available}</div>
      </div>
      <div>
        <div className="text-xs text-neutral300">Booked</div>
        <div className="text-primary600 font-bold">{booked}</div>
      </div>
    </div>
  </div>
);
export default StatCard;
