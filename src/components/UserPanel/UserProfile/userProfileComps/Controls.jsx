import { FaRegPlayCircle, FaRegClock } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import Button from "../../../ui/buttons/Button";


export default function Controls({ status, profileImg, geoAllowed, breakUsedMs, openModal }) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      {!status.checkedIn && (
        <Button className="w-full sm:w-auto flex items-center gap-2" variant="primary" onClick={() => openModal("checkin")} disabled={!profileImg || !geoAllowed}>
          <FaRegPlayCircle className="text-lg" /> Check in
        </Button>
      )}

      {status.checkedIn && !status.checkedOutAt && (
        <Button className="w-full sm:w-auto flex items-center gap-2" onClick={() => openModal("checkout")} disabled={!profileImg || !geoAllowed} variant="outline">
          <FaRegPlayCircle className="text-lg" /> Check out
        </Button>
      )}

      {status.checkedIn && !status.checkedOutAt && !status.breakSessionStart && (
        <Button className="w-full sm:w-auto flex items-center gap-2" onClick={() => openModal("startBreak")} disabled={breakUsedMs >= 30 * 60000}>
          <IoTimeOutline /> Start break
        </Button>
      )}

      {status.checkedIn && !status.checkedOutAt && status.breakSessionStart && (
        <Button className="w-full sm:w-auto flex items-center gap-2" onClick={() => openModal("endBreak")}>
          <FaRegClock /> End break
        </Button>
      )}
    </div>
  );
}
