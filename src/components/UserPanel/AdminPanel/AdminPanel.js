import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Button from "../../ui/buttons/Button";
import InputField from "../../ui/InputFields/InputField";
import PhoneInputField from "../../ui/InputFields/PhoneInputField";
import SidePanel from "../../ui/SidePanel";
import ReusableTable from "../../ui/tables/ReusableTable";
import { getAllUser, SaveEditUser } from "../../../api/ApiCalls";

const userColumns = [
  { Header: "S No.", accessor: "serial" },
  { Header: "Full name", accessor: "fullName" },
  { Header: "Email", accessor: "email" },
  { Header: "Status", accessor: "status" },
  { Header: "Phone", accessor: "phone" },
  { Header: "Created", accessor: "created" }
];

const roleOptions = [
  { value: 0, label: "ADMIN" },
  { value: 1, label: "HR" },
  { value: 2, label: "EMPLOYEE" }
];

const employmentOptions = [
  { value: "PROBATION", label: "PROBATION" },
  { value: "FULL_TIME", label: "FULL_TIME" },
  { value: "TRAINEE", label: "TRAINEE" },
  { value: "NOTICE_PERIOD", label: "NOTICE_PERIOD" }
];

const departmentOptions = [
  { value: "ENGINEERING", label: "Engineering" },
  { value: "FINANCE", label: "Finance" },
  { value: "ACCOUNTS", label: "Accounts" },
  { value: "SALES", label: "Sales" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "HR", label: "HR" }
];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: null,
    email: "",
    password: "",
    fullName: "",
    phone: "",
    employeeCode: "",
    roleId: 0,
    orgId: 1,
    department: "",
    designation: "",
    dateOfJoining: "",
    latitude: "",
    longitude: "",
    employmentType: "PROBATION"
  });

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        setLoadingUsers(true);
        const resp = await getAllUser();
        if (!m) return;
        const list = resp?.data?.data || resp?.data || [];
        const mapped = list.map((u, i) => ({
          id: u.id,
          serial: i + 1,
          fullName: u.fullName || u.email || `User ${u.id}`,
          email: u.email || "",
          status: u.isActive ? "Active" : "Inactive",
          phone: u.phone || "",
          created: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
          employeeCode: u.employeeCode || `EMP-${u.id}`,
          raw: u
        }));
        setUsers(mapped);
      } catch {
        setUsers([]);
      } finally {
        if (m) setLoadingUsers(false);
      }
    })();
    return () => { m = false; };
  }, []);

  function openAdd() {
    setEditingUser(null);
    setForm({
      id: null,
      email: "",
      password: "",
      fullName: "",
      phone: "",
      employeeCode: "",
      roleId: 0,
      orgId: 1,
      department: "",
      designation: "",
      dateOfJoining: "",
      latitude: "",
      longitude: "",
      employmentType: "PROBATION"
    });
    setPanelOpen(true);
  }

  function openEdit(row) {
    const raw = row.raw || {};
    setEditingUser(row);

    const roleId =
      roleOptions.find(r => r.label === (raw.roleName || ""))?.value ?? 0;

    setForm({
      id: raw.id || null,
      email: raw.email || "",
      password: "",
      fullName: raw.fullName || "",
      phone: raw.phone || "",
      employeeCode: raw.employeeCode || "",
      roleId,
      orgId: raw.orgId || 1,
      department: raw.department || "",
      designation: raw.designation || "",
      dateOfJoining: raw.dateOfJoining || "",
      latitude: raw.latitude ?? "",
      longitude: raw.longitude ?? "",
      employmentType: raw.employmentType || "PROBATION"
    });

    setPanelOpen(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        email: form.email,
        password: form.password || undefined,
        fullName: form.fullName,
        phone: form.phone,
        employeeCode: form.employeeCode,
        roleId: form.roleId,
        orgId: 1,
        department: form.department,
        designation: form.designation,
        dateOfJoining: form.dateOfJoining || undefined,
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0,
        employmentType: form.employmentType
      };

      await SaveEditUser(payload);

      const resp = await getAllUser();
      const list = resp?.data?.data || resp?.data || [];

      const mapped = list.map((u, i) => ({
        id: u.id,
        serial: i + 1,
        fullName: u.fullName || u.email || `User ${u.id}`,
        email: u.email || "",
        status: u.isActive ? "Active" : "Inactive",
        phone: u.phone || "",
        created: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
        employeeCode: u.employeeCode || `EMP-${u.id}`,
        raw: u
      }));

      setUsers(mapped);
      setPanelOpen(false);
      setEditingUser(null);
    } catch {}
    finally {
      setSaving(false);
    }
  }

  function handleDelete(row) {
    setUsers(current =>
      current.filter(x => x.id !== row.id).map((x, i) => ({ ...x, serial: i + 1 }))
    );
  }

  const actions = [
    { label: "Edit", icon: FaEdit, color: "primary600", onClick: openEdit },
    { label: "Delete", icon: FaTrash, color: "red-600", onClick: handleDelete }
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="text-2xl font-bold">Employee Management</div>
        <Button onClick={openAdd} className="flex gap-2 items-center">
          <FaPlus /> Add Employee
        </Button>
      </div>

      <ReusableTable
        columnsDef={userColumns}
        data={users ?? []}
        actions={actions}
        loading={loadingUsers}
      />

      <SidePanel
        open={panelOpen}
        onClose={() => { setPanelOpen(false); setEditingUser(null); }}
        title={editingUser ? "Edit Employee" : "Add Employee"}
      >
        <div className="p-6 text-sm">
          <form onSubmit={handleSave} className="space-y-4">

            <InputField label="Full name" name="fullName" value={form.fullName} onChange={handleChange} />
            <InputField label="Email" name="email" value={form.email} onChange={handleChange} />

            {!editingUser && (
              <InputField label="Password" name="password" type="password" value={form.password} onChange={handleChange} showEye />
            )}

            <PhoneInputField label="Phone number" value={form.phone} onChange={(v) => setForm(f => ({ ...f, phone: v }))} />

            <InputField label="Employee code" name="employeeCode" value={form.employeeCode} onChange={handleChange} />

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select name="roleId" value={form.roleId} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white">
                {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Employment type</label>
              <select name="employmentType" value={form.employmentType} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white">
                {employmentOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select name="department" value={form.department} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white">
                {departmentOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            <InputField label="Designation" name="designation" value={form.designation} onChange={handleChange} />

            <InputField label="Date of joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={handleChange} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Latitude" name="latitude" value={form.latitude} onChange={handleChange} />
              <InputField label="Longitude" name="longitude" value={form.longitude} onChange={handleChange} />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" type="button" onClick={() => setPanelOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </div>
      </SidePanel>
    </div>
  );
}
