import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Wrapper from '../components/Wrapper';
import { User, X, AlertTriangle, Check, XCircle } from 'lucide-react';
import { API } from '../api'; // Your API client

interface Listing {
  id: string;
  name: string;
  listingTitle: string;
  imageUrl: string;
  reportReason: string;
  status: string;
}

const Report = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch properties with reportReason
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await API.get('/property/properties', {
        params: {
          search: searchTerm,
          hasReportReason: 'true',
        },
      });
      const properties = response.data.properties
        .filter((property: any) => property.reportReason && property.reportReason.trim() !== '') // Exclude empty reportReason
        .map((property: any) => ({
          id: property._id,
          name: property.ownername ? property.ownername.username || 'Unknown User' : 'Unknown User',
          listingTitle: property.PropertyName,
          imageUrl: property.PropertyImage || 'https://via.placeholder.com/150',
          reportReason: property.reportReason,
          status: 'Pending', // Default; adjust if stored in backend
        }));
      setListings(properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch reported properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchTerm]);

  const filteredListings = listings.filter((listing) =>
    [listing.name, listing.listingTitle, listing.reportReason].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleReportIssue = (listing: Listing) => {
    setSelectedListing(listing);
    setReportReason(listing.reportReason || '');
    setIsModalOpen(true);
  };

  // const handleApprove = (listing: Listing) => {
  //   setListings((prevListings) =>
  //     prevListings.map((item) =>
  //       item.id === listing.id ? { ...item, status: 'Approved', reportReason: '' } : item
  //     )
  //   );
  //   toast.success(`${listing.listingTitle} approved successfully`);
  // };

  // const handleReject = (listing: Listing) => {
  //   setListings((prevListings) =>
  //     prevListings.map((item) =>
  //       item.id === listing.id ? { ...item, status: 'Rejected' } : item
  //     )
  //   );
  //   toast.error(`${listing.listingTitle} rejected`);
  // };

   const handleApprove = async (listing: Listing) => {
    try {
      await API.put(`/property/property/update-report-status/${listing.id}`, { status: 'approve' });
      setListings((prevListings) =>
        prevListings.filter((item) => item.id !== listing.id) // Remove since reportReason is cleared
      );
      toast.success(`${listing.listingTitle} approved successfully`);
    } catch (error) {
      console.error('Error approving report:', error);
      toast.error('Failed to approve report');
    }
  };

  const handleReject = async (listing: Listing) => {
    try {
      await API.put(`/property/property/update-report-status/${listing.id}`, { status: 'reject' });
      setListings((prevListings) =>
        prevListings.filter((item) => item.id !== listing.id) // Remove since reportReason is cleared
      );
      toast.error(`${listing.listingTitle} rejected`);
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast.error('Failed to reject report');
    }
  };

  const handleModalAction = (action: 'reported' | 'cancel') => {
    if (selectedListing) {
      if (action === 'reported') {
        setListings((prevListings) =>
          prevListings.map((listing) =>
            listing.id === selectedListing.id
              ? { ...listing, reportReason: reportReason.trim(), status: 'Pending' }
              : listing
          )
        );
      }
      setReportReason('');
    }
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  return (
    <Wrapper>
      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search reported listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded-md bg-[#162042] text-white secondaryFont text-sm focus:outline-none focus:ring-2 focus:ring-[#1d2a5b]"
          />
        </div>
        {loading ? (
          <p className="text-white secondaryFont text-sm">Loading...</p>
        ) : filteredListings.length === 0 ? (
          <p className="text-white secondaryFont text-sm">No reported properties found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-[#101828] rounded-lg p-4 flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="secondaryFont text-sm text-white">{listing.name}</div>
                </div>
                <img
                  src={listing.imageUrl}
                  alt={listing.listingTitle}
                  className="w-full h-48 rounded-md object-cover"
                />
                <div>
                  <h3 className="secondaryFont text-lg text-white">{listing.listingTitle}</h3>
                  <p className="secondaryFont text-sm text-gray-400">
                    Report Reason: {listing.reportReason}
                  </p>
                  <p
                    className={`secondaryFont text-sm ${
                      listing.status === 'Approved'
                        ? 'text-green-500'
                        : listing.status === 'Rejected'
                        ? 'text-red-500'
                        : 'text-yellow-500'
                    }`}
                  >
                    Status: {listing.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReportIssue(listing)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-md secondaryFont text-sm hover:bg-yellow-600 flex items-center gap-1"
                  >
                    <AlertTriangle size={16} />
                    Edit Report
                  </button>
                  <button
                    onClick={() => handleApprove(listing)}
                    className="px-3 py-1 bg-green-500 text-white rounded-md secondaryFont text-sm hover:bg-green-600 flex items-center gap-1 disabled:opacity-50"
                    disabled={listing.status !== 'Pending'}
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(listing)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md secondaryFont text-sm hover:bg-red-600 flex items-center gap-1 disabled:opacity-50"
                    disabled={listing.status !== 'Pending'}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#101828] bg-opacity-90 backdrop-blur-md">
          <div className="bg-[#101828] w-96 rounded-lg shadow-2xl p-6 relative">
            <button
              onClick={() => { setIsModalOpen(false); setSelectedListing(null); setReportReason(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col gap-4">
              <h2 className="secondaryFont text-white text-lg font-semibold">Edit Report Reason</h2>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the reason for reporting..."
                className="w-full h-24 p-2 rounded-md bg-[#162042] text-white secondaryFont text-sm focus:outline-none focus:ring-2 focus:ring-[#1d2a5b]"
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleModalAction('reported')}
                  className="px-4 py-2 bg-red-500 text-white rounded-md secondaryFont text-sm hover:bg-red-600"
                  disabled={!reportReason.trim()}
                >
                  Submit Report
                </button>
                <button
                  onClick={() => handleModalAction('cancel')}
                  className="px-4 py-2 bg-green-500 text-white rounded-md secondaryFont text-sm hover:bg-green-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default Report;