import React, { useState } from 'react';
import { useGetAllDriverRequests, useUpdateDriverStatus } from '../../api\'s/admin/admin.query';

function DriverRequests() {
  const { data, isLoading, isError, error } = useGetAllDriverRequests();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateDriverStatus();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = (driverId) => {
    updateStatus({ driverId, status: "approved" });
  };

  const handleRejectClick = (driverId) => {
    setSelectedDriverId(driverId);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    updateStatus(
      { driverId: selectedDriverId, status: "rejected", rejectedReason: rejectionReason },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          setRejectionReason('');
          setSelectedDriverId(null);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading driver requests...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold">Error loading driver requests</h3>
        <p className="text-red-600 mt-2">{error?.response?.data?.message || 'Something went wrong'}</p>
      </div>
    );
  }

  const driverRequests = data?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Driver Requests</h1>
        <p className="text-gray-600 mt-2">
          Manage and review driver applications ({driverRequests.length} pending)
        </p>
      </div>

      {driverRequests.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No driver requests at the moment</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {driverRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {request.userId?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.userId?.email || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          License: {request.licenseNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.userId?.phoneNumber || 'N/A'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.experience || 0} years
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {request.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={request.status === 'approved' || isUpdating}
                        >
                          {isUpdating ? "Processing..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectClick(request._id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={request.status === 'rejected' || isUpdating}
                        >
                          {isUpdating ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Driver Request</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              rows="4"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedDriverId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverRequests;
