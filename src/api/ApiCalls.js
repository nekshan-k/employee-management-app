import { apiClient1 } from "./apiClient"

export const loginApi = payload => apiClient1.post("/auth/login", payload)

export const getProfile = () => apiClient1.get("/user/profile")

export const uploadAttendancePic = ({ userid, file }) => {
  const form = new FormData()
  form.append("photo", file, file.name)
  form.append("photoContentType", file.type || "image/jpeg")
  form.append("photoFileName", file.name || "upload.jpg")
  return apiClient1.post("/attendance/picture", form, {
    params: { UserId: userid },
    headers: { "Content-Type": "multipart/form-data" }
  })
}

export const uploadUserProfilePhoto = (userId, form) => {
  return apiClient1.post(`/users/${userId}/profile-photo`, form)
}
export const submitAttendance = (userId, latitude, longitude, attendenceType, payload) => {
  const params = new URLSearchParams()
  if (userId !== undefined && userId !== null) params.append("userId", String(userId))
  if (latitude !== undefined && latitude !== null) params.append("latitude", String(latitude))
  if (longitude !== undefined && longitude !== null) params.append("longitude", String(longitude))
  if (attendenceType !== undefined && attendenceType !== null) params.append("attendenceType", String(attendenceType))
  return apiClient1.post(`/attendance/attendence?${params.toString()}`, payload)
}
export const getUserTodayAttendance = () => apiClient1.get("/attendance/today")


export const getUserProfile = id => apiClient1.get(`/users/${id}`)

export const submitAttendanceAction = ({ attendanceType, latitude, longitude, file }) => {
  const form = new FormData()
  if (attendanceType !== undefined && attendanceType !== null) form.append("attendanceType", String(attendanceType))
  if (latitude !== undefined && latitude !== null) form.append("latitude", String(latitude))
  if (longitude !== undefined && longitude !== null) form.append("longitude", String(longitude))
  if (file) form.append("file", file, file.name)
  return apiClient1.post("/attendance/action", form, {
    headers: { "Content-Type": "multipart/form-data" }
  })
}


// LEAVES AND HOLIDAYS

export const getNationalHolidays = () => apiClient1.get("/holidays")

export const getAttendanceHistory = (userId, from, to) =>
  apiClient1.get(`/attendance/${userId}/history`, {
    params: { from, to }
  });

  export const getLaveBalance = userId  => apiClient1.get(`/leaves/balance/${userId }`)
   export const getLaveHistoryByUserId = userId  => apiClient1.get(`/leaves/history/${userId }`)

   export const ApplyLeave = payload => apiClient1.post("/leaves/apply", payload)

  //  Admin Panle apis

  export const getAllUser = () => apiClient1.get("/users")

  export const getAttendanceHistoryForAll = ( from, to) =>
  apiClient1.get(`/attendance/allUserHistory`, {
    params: { from, to }
  });

export const SaveUser = payload =>
  apiClient1.post("/users/adduser", payload);

  export const UpdateUser = (id, payload) =>
  apiClient1.put(`/users/${id}`, payload);

export const DeleteUser = id =>
  apiClient1.delete(`/users/${id}`);

export const getAllAppliedLeaves = () =>
  apiClient1.get("/leaves/getAllUserLeaves");

export const approveLeave = (id, status = "APPROVED") =>
  apiClient1.post(`/leaves/${id}/approve`, { status });

export const rejectLeave = (id, status = "REJECTED") =>
  apiClient1.post(`/leaves/${id}/reject`, { status });
