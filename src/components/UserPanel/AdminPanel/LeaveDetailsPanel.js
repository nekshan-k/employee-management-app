import React from "react";
import Button from "../../ui/buttons/Button";
import StatusBadge from "../../ui/StatusBadge";
import FormattedDate from "../../ui/FormattedDate";

export default function LeaveDetailsPanel({ leave, loadingAction, onApprove, onReject }) {
  if (!leave) {
    return (
      <div className="p-6 text-sm text-neutral500">
        Select a leave request to view details.
      </div>
    );
  }

  const statusBadge =
    leave.status === "APPROVED" ? (
      <StatusBadge type="ACTIVE" label="Approved" />
    ) : leave.status === "REJECTED" ? (
      <StatusBadge type="DELETED" label="Rejected" />
    ) : (
      <StatusBadge type="INACTIVE" label="Pending" />
    );

  return (
    <div className="p-6 text-sm space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-neutral900">
              {leave.userFullName}
            </div>
            <div className="text-xs text-neutral500">Leave ID: {leave.id}</div>
          </div>
          {statusBadge}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs text-neutral500 mb-1">From</div>
          <FormattedDate date={leave.startDate} />
        </div>
        <div>
          <div className="text-xs text-neutral500 mb-1">To</div>
          <FormattedDate date={leave.endDate} />
        </div>
        <div>
          <div className="text-xs text-neutral500 mb-1">Type</div>
          <div className="font-medium text-neutral800">{leave.leaveType}</div>
        </div>
        <div>
          <div className="text-xs text-neutral500 mb-1">User ID</div>
          <div className="text-neutral800">{leave.userId}</div>
        </div>
      </div>

      <div>
        <div className="text-xs text-neutral500 mb-1">Reason</div>
        <div className="rounded border border-neutral100 bg-neutral50 px-3 py-2 text-sm text-neutral800">
          {leave.reason}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="outline"
          type="button"
          onClick={onReject}
          disabled={loadingAction}
        >
          {loadingAction ? "Processing..." : "Reject"}
        </Button>
        <Button
          type="button"
          onClick={onApprove}
          disabled={loadingAction}
        >
          {loadingAction ? "Processing..." : "Approve"}
        </Button>
      </div>
    </div>
  );
}
