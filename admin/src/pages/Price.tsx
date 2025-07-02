import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Wrapper from '../components/Wrapper';
import { User, Check, XCircle } from 'lucide-react';
import { API } from '../api'; // Your API client (e.g., Axios)

interface Listing {
  id: string;
  name: string;
  listingTitle: string;
  imageUrl: string;
  price: number;
  description: string;
  status: string;
}

const Price = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hasUpdatePrice, setHasUpdatePrice] = useState<boolean>(true); // Default to true for UpdatePrice filter
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await API.get('/property/properties', {
        params: {
          search: searchTerm,
          hasUpdatePrice: hasUpdatePrice ? 'true' : '',
        },
      });
      const properties = response.data.properties
        .filter((property: any) => property.UpdatePrice && property.UpdatePrice !== '') // Exclude empty UpdatePrice
        .map((property: any) => ({
          id: property._id,
          name: property.ownername ? property.ownername.username || 'Unknown User' : 'Unknown User',
          listingTitle: property.PropertyName,
          imageUrl: property.PropertyImage || 'https://via.placeholder.com/150',
          price: Number(property.UpdatePrice),
          description: property.PropertyDes || 'No description',
          status: 'Pending',
        }));
      setListings(properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (listing: Listing) => {
    try {
      await API.put(`/property/property/update-price-status/${listing.id}`, { status: 'approve' });
      setListings((prevListings) =>
        prevListings.filter((item) => item.id !== listing.id) // Remove since UpdatePrice is cleared
      );
      setListings((prevListings) =>
      prevListings.map((item) =>
        item.id === listing.id ? { ...item, status: 'Approved' } : item
      )
    );
    toast.success(`${listing.listingTitle} approved successfully`);
    } catch (error) {
      console.error('Error approving price:', error);
      toast.error('Failed to approve price');
    }
  };

  const handleReject = async (listing: Listing) => {
    try {
      await API.put(`/property/property/update-price-status/${listing.id}`, { status: 'reject' });
      setListings((prevListings) =>
      prevListings.map((item) =>
        item.id === listing.id ? { ...item, status: 'Rejected' } : item
      )
    );
    toast.error(`${listing.listingTitle} rejected`);
    } catch (error) {
      console.error('Error rejecting price:', error);
      toast.error('Failed to reject price');
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchTerm, hasUpdatePrice]);

  const filteredListings = listings.filter((listing) =>
    [listing.name, listing.listingTitle, listing.price.toString(), listing.description].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // const handleApprove = (listing: Listing) => {
  //   setListings((prevListings) =>
  //     prevListings.map((item) =>
  //       item.id === listing.id ? { ...item, status: 'Approved' } : item
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

  return (
    <Wrapper>
      <div className="p-4">
        <div className="mb-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded-md bg-[#162042] text-white secondaryFont text-sm focus:outline-none focus:ring-2 focus:ring-[#1d2a5b]"
          />
          <label className="flex items-center gap-2 text-white secondaryFont text-sm">
            <input
              type="checkbox"
              checked={hasUpdatePrice}
              onChange={(e) => setHasUpdatePrice(e.target.checked)}
              className="h-5 w-5 text-[#1d2a5b] focus:ring-[#1d2a5b]"
            />
            Show only updated prices
          </label>
        </div>
        {loading ? (
          <p className="text-white secondaryFont text-sm">Loading...</p>
        ) : filteredListings.length === 0 ? (
          <p className="text-white secondaryFont text-sm">No properties with updated price found</p>
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
                    Price: ${listing.price}
                  </p>
                  <p className="secondaryFont text-sm text-gray-400">
                    Description: {listing.description}
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
    </Wrapper>
  );
};

export default Price;