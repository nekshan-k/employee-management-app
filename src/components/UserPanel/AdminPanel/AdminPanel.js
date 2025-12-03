import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Button from "../../ui/buttons/Button";
import SidePanel from "../../ui/SidePanel";
import ReusableTable from "../../ui/tables/ReusableTable";
import { DeleteUser, getAllUser, SaveUser, UpdateUser } from "../../../api/ApiCalls";
import { toast } from "react-toastify";
import CustomToast from "../../ui/Toast/CustomToast";
import EmployeeForm from "./EmployeeForm";

const userColumns = [
  { Header: "Employee Code", accessor: "employeeCode" },
  { Header: "Full name", accessor: "fullName" },
  { Header: "Email", accessor: "email" },
  { Header: "Phone", accessor: "phone" },
  { Header: "Role", accessor: "roleName" },
  { Header: "Employment Type", accessor: "employmentType" }
];

const roleOptions = [
  { value: 1, label: "ADMIN" },
  { value: 2, label: "HR" },
  { value: 3, label: "EMPLOYEE" }
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
    fullName: "",
    phone: "",
    employeeCode: "",
    roleId: "",
    roleName: "",
    orgId: 1,
    department: "",
    designation: "",
    dateOfJoining: "",
    latitude: "",
    longitude: "",
    employmentType: "",
    profileImageUrl: ""
  });

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        setLoadingUsers(true);
        const resp = await getAllUser();
        if (!m) return;
        const list = resp?.data?.data || resp?.data || [];
        const mapped = list.map((u, i) => {
          const avatar = u.profileImageUrl || "";
          const nameEl = (
            <div className="flex items-center gap-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt={u.fullName || "avatar"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral200 flex items-center justify-center text-xs font-medium text-neutral700">
                  {String((u.fullName || u.email || "").slice(0, 1)).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">
                  {u.fullName || u.email || `User ${u.id}`}
                </div>
                <div className="text-xs text-neutral400 truncate">
                  {u.designation || ""}
                </div>
              </div>
            </div>
          );
          return {
            id: u.id,
            serial: i + 1,
            employeeCode: u.employeeCode || `EMP-${u.id}`,
            fullName: nameEl,
            email: u.email || "",
            phone: u.phone || "",
            roleName: u.roleName || "",
            employmentType: u.employmentType || "",
            raw: u
          };
        });
        setUsers(mapped);
      } catch {
        setUsers([]);
      } finally {
        if (m) setLoadingUsers(false);
      }
    })();
    return () => {
      m = false;
    };
  }, []);

  function openAdd() {
    setEditingUser(null);
    setForm({
      id: null,
      email: "",
      fullName: "",
      phone: "",
      employeeCode: "",
      roleId: "",
      roleName: "",
      orgId: 1,
      department: "",
      designation: "",
      dateOfJoining: "",
      latitude: "",
      longitude: "",
      employmentType: "",
      profileImageUrl: ""
    });
    setPanelOpen(true);
  }

function openEdit(row) {
  const raw = row.raw || {};
  const roleFromName = roleOptions.find(r => r.label === raw.roleName);
  const roleId = roleFromName ? roleFromName.value : "";
  const roleName = roleFromName ? roleFromName.label : "";

  setEditingUser(row);
  setForm({
    id: raw.id || null,
    email: raw.email || "",
    fullName: raw.fullName || "",
    phone: raw.phone || "",
    employeeCode: raw.employeeCode || "",
    roleId,
    roleName,
    orgId: raw.orgId || 1,
    department: raw.department || "",
    designation: raw.designation || "",
    dateOfJoining: raw.dateOfJoining || "",
    latitude: raw.latitude ?? "",
    longitude: raw.longitude ?? "",
    employmentType: raw.employmentType || "",
    profileImageUrl: raw.profileImageUrl || ""
  });
  setPanelOpen(true);
}

function handleChange(e) {
  const { name, value } = e.target;
  if (name === "roleId") {
    const numeric = value === "" ? "" : Number(value);
    const selected = roleOptions.find(r => r.value === numeric);
    setForm(f => ({
      ...f,
      roleId: numeric,
      roleName: selected?.label || ""
    }));
  } else {
    setForm(f => ({ ...f, [name]: value }));
  }
}

  async function handleSaveWithPassword(passwordFromChild) {
    setSaving(true);
    try {
      const payload = {
        email: form.email,
        fullName: form.fullName,
        phone: form.phone,
        department: form.department,
        designation: form.designation,
        dateOfJoining: form.dateOfJoining || null,
        employmentType: form.employmentType,
        employeeCode: form.employeeCode,
        roleId: form.roleId,
        roleName: form.roleName,
        username: form.email,
        isActive: true,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        profileImageUrl: form.profileImageUrl || ""
      };

      if (editingUser && form.id) {
        await UpdateUser(form.id, payload);
        toast.success("Employee updated successfully");
      } else {
        const createPayload = {
          ...payload,
          password: passwordFromChild
        };
        await SaveUser(createPayload);
        toast.success("Employee created successfully");
      }

      const resp = await getAllUser();
      const list = resp?.data?.data || resp?.data || [];
      const mapped = list.map((u, i) => {
        const avatar = u.profileImageUrl || "";
        const nameEl = (
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={u.fullName || "avatar"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral200 flex items-center justify-center text-xs font-medium text-neutral700">
                {String((u.fullName || u.email || "").slice(0, 1)).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">
                {u.fullName || u.email || `User ${u.id}`}
              </div>
              <div className="text-xs text-neutral400 truncate">
                {u.designation || ""}
              </div>
            </div>
          </div>
        );
        return {
          id: u.id,
          serial: i + 1,
          employeeCode: u.employeeCode || `EMP-${u.id}`,
          fullName: nameEl,
          email: u.email || "",
          phone: u.phone || "",
          roleName: u.roleName || "",
          employmentType: u.employmentType || "",
          raw: u
        };
      });

      setUsers(mapped);
      setPanelOpen(false);
      setEditingUser(null);
    } catch {
      toast.error("Failed to save employee");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(row) {
    DeleteUser(row.id)
      .then(() => {
        setUsers(current =>
          current
            .filter(x => x.id !== row.id)
            .map((x, i) => ({ ...x, serial: i + 1 }))
        );
        toast.success("Employee deleted successfully");
      })
      .catch(() => {
        toast.error("Failed to delete employee");
      });
  }

  const actions = [
    { label: "Edit", icon: FaEdit, color: "primary600", onClick: openEdit },
    { label: "Delete", icon: FaTrash, color: "red-600", onClick: handleDelete }
  ];

  return (
    <div className="p-8">
      <CustomToast />
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
        onClose={() => {
          setPanelOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? "Edit Employee" : "Add Employee"}
      >
        <EmployeeForm
          form={form}
          saving={saving}
          editingUser={editingUser}
          roleOptions={roleOptions}
          employmentOptions={employmentOptions}
          departmentOptions={departmentOptions}
          onChange={handleChange}
          onPhoneChange={v => setForm(f => ({ ...f, phone: v }))}
          onCancel={() => {
            setPanelOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleSaveWithPassword}
        />
      </SidePanel>
    </div>
  );
}
