import Button from "../../../ui/buttons/Button";

export default function ProfileHeader({ demoUser, profileImg, attendanceState, userLatLng, geoAllowed, onUploadClick, onClear, onUploadChange }) {
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-border bg-white overflow-hidden flex items-center justify-center">
          {profileImg ? <img src={profileImg} alt="profile" className="w-full h-full object-cover" /> : <span className="text-[10px] text-foundation-neurtal-neurtal-500 px-2 text-center">Upload photo</span>}
        </div>
        {attendanceState === "Working" && <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />}
      </div>
      <div className="space-y-0.5">
        <div className="text-sm sm:text-base font-semibold text-primary500">{demoUser.name}</div>
        <div className="text-xs sm:text-sm text-neurtal500">{demoUser.roleName}</div>
        <div className="text-[11px] text-neurtal500">ID: {demoUser.employeeId}</div>
        {userLatLng && <div className="text-[11px] text-neurtal500">Location: {userLatLng.lat.toFixed(5)}, {userLatLng.lon.toFixed(5)}</div>}
        {!geoAllowed && <div className="text-[11px] text-amber-600 mt-1">Outside office geo-fence. Check-in disabled.</div>}
      </div>
      <div className="ml-auto flex flex-col items-end gap-2 w-full sm:w-44">
        <input id="imgUpload" type="file" accept="image/*" className="hidden" onChange={onUploadChange} />
        <Button size="sm" className="w-full justify-center" variant="primary" onClick={onUploadClick}>{profileImg ? "Change photo" : "Upload photo"}</Button>
        {profileImg && <Button size="sm" variant="red" onClick={onClear}>Remove</Button>}
      </div>
    </div>
  );
}
