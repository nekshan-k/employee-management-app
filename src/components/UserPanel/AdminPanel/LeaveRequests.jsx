import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomToast from "../../ui/Toast/CustomToast";
import SidePanel from "../../ui/SidePanel";
import ReusableLeaveTable from "../../ui/tables/ReusableLeaveTable";
import LeaveDetailsPanel from "./LeaveDetailsPanel";
import {
  getAllAppliedLeaves,
  approveLeave,
  rejectLeave
} from "../../../api/ApiCalls";
import StatusBadge from "../../ui/StatusBadge";
import FormattedDate from "../../ui/FormattedDate";

export default function LeaveRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const baseColumns = [
    { header: "Employee", accessor: "userFullName" },
    {
      header: "From",
      accessor: "startDate",
      cell: r => <FormattedDate date={r.startDate} />
    },
    {
      header: "To",
      accessor: "endDate",
      cell: r => <FormattedDate date={r.endDate} />
    },
    { header: "Type", accessor: "leaveType" },
    {
      header: "Status",
      accessor: "status",
      cell: r => {
        if (!r.status) return null;
        if (r.status === "APPROVED") {
          return <StatusBadge type="ACTIVE" label="Approved" />;
        }
        if (r.status === "REJECTED") {
          return <StatusBadge type="DELETED" label="Rejected" />;
        }
        return <StatusBadge type="INACTIVE" label="Pending" />;
      }
    },
    {
      header: "Action",
      accessor: "action",
      cell: r =>
        r.isSpacer ? null : r.status === "PENDING" ? (
          <button
            type="button"
            className="text-xs px-3 py-1 rounded border border-neutral300 text-neutral700 hover:bg-neutral50"
            onClick={() => handleView(r)}
          >
            View
          </button>
        ) : (
          <span className="text-xs text-neutral400">—</span>
        )
    }
  ];

  const columns = baseColumns;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await getAllAppliedLeaves();
        const list = resp?.data?.data || resp?.data || [];
        if (mounted) setRows(list);
      } catch {
        if (mounted) setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function handleView(row) {
    if (row.isSpacer) return;
    setSelectedLeave(row);
    setPanelOpen(true);
  }

  async function refreshLeaves() {
    const resp = await getAllAppliedLeaves();
    const list = resp?.data?.data || resp?.data || [];
    setRows(list);
  }

  async function handleApprove() {
    if (!selectedLeave) return;
    setActionLoading(true);
    try {
      await approveLeave(selectedLeave.id, "APPROVED");
      toast.success("Leave approved successfully");
      await refreshLeaves();
      setPanelOpen(false);
      setSelectedLeave(null);
    } catch {
      toast.error("Failed to approve leave");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedLeave) return;
    setActionLoading(true);
    try {
      await rejectLeave(selectedLeave.id, "REJECTED");
      toast.success("Leave rejected successfully");
      await refreshLeaves();
      setPanelOpen(false);
      setSelectedLeave(null);
    } catch {
      toast.error("Failed to reject leave");
    } finally {
      setActionLoading(false);
    }
  }

  const groupedWithBlankRows = (() => {
    const byUser = rows.reduce((acc, leave) => {
      const key = leave.userId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(leave);
      return acc;
    }, {});
    const result = [];
    Object.values(byUser).forEach(leaves => {
      leaves.forEach((l, index) => {
        result.push({
          ...l,
          userFullName: index === 0 ? l.userFullName : "",
          isSpacer: false
        });
      });
      result.push({
        id: `spacer-${result.length}`,
        userFullName: "",
        startDate: "",
        endDate: "",
        leaveType: "",
        status: "",
        isSpacer: true
      });
    });
    return result;
  })();

  return (
    <div className="p-6 bg-white rounded-xl border border-neutral100">
      <CustomToast />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral900">Leave Requests</h2>
      </div>

      {loading ? (
        <div className="text-sm text-neutral500 px-2 py-4">Loading...</div>
      ) : (
        <ReusableLeaveTable columns={columns} data={groupedWithBlankRows} />
      )}

      <SidePanel
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setSelectedLeave(null);
        }}
        title="Leave details"
      >
        <LeaveDetailsPanel
          leave={selectedLeave}
          loadingAction={actionLoading}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </SidePanel>
    </div>
  );
}
