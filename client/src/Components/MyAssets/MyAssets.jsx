/* global BigInt */

/* global BigInt */

import React, { useEffect, useState } from "react";
import SideBar from "../SideBar/SideBar";
import Property_card from "../Property_card/Property_card";
import p1 from "../Assets/p1.png";
import p2 from "../Assets/p2.png";
import p3 from "../Assets/p3.png";
import p4 from "../Assets/p4.png";
import { IoSearchSharp } from "react-icons/io5";
import { API } from "../../API/API";
import { useAccount } from "wagmi";
import {
  prepareWriteContract,
  waitForTransaction,
  writeContract,
} from "@wagmi/core";
import {
  Property_Contract_Abi,
  Property_Contract_Address,
} from "../../utilies/constant";
import toast from "react-hot-toast";

const initialProperties = [];

export default function MyAssets({ selectedMenu, setSelectedMenu }) {
  const [properties, setProperties] = useState();
  const { address } = useAccount();
  const [listOfProperties, setListOfProperties] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const toggleFavorite = (id) => {
    setProperties((prevProperties) =>
      prevProperties.map((property) =>
        property.id === id
          ? { ...property, isFavorite: !property.isFavorite }
          : property
      )
    );
  };

  const getMyPropertyList = async () => {
    try {
      let res = await API.get(`/property/${address}`);
      // let getSale = await API.get(`/sale/${user?._id}`);
      let resInverter = await API.get(`/property/inverter/${user?._id}`);
      let resOwnerAddress = await API.get(`/property/property/byOwnerAddress/${address}`);

      const ownerPropsDataArray = res?.data?.property || [];
      const inverterPropsDataArray = resInverter?.data?.properties || [];
      // const ownerSaleRecord = getSale?.data?.property || [];
      const ownerAddressPropsArray = resOwnerAddress?.data?.properties || [];

      const combinedArray = [
        ...ownerPropsDataArray,
        ...inverterPropsDataArray,
        // ...ownerSaleRecord,
        ...ownerAddressPropsArray,
      ];

      const uniqueCombined = combinedArray.reduce((acc, curr) => {
        if (!acc.find((item) => item._id === curr._id)) {
          acc.push(curr);
        }
        return acc;
      }, []);

      setListOfProperties(uniqueCombined);
    } catch (error) {
      console.log("Error fetching properties:", error);
      toast.error("Failed to load properties");
    }
  };

  useEffect(() => {
    if (address && user?._id) {
      getMyPropertyList();
    }
  }, [address, user]);

  function getMatchingInverter(property, currentUserId) {
    if (property.inverter1 && property.inverter1._id === currentUserId) {
      return property.inverter1;
    }
    if (property.inverter2 && property.inverter2._id === currentUserId) {
      return property.inverter2;
    }
    return null;
  }

  const handleSaleProperty = async (items, buyerAddress, shareAmount) => {
    try {
      const { request } = await prepareWriteContract({
        address: Property_Contract_Address,
        abi: Property_Contract_Abi,
        functionName: "sellShare",
        args: [items.nftId, address, 1],
        account: address,
      });

      const { hash } = await writeContract(request);
      const data = await waitForTransaction({ hash });

      const matchingInverter = getMatchingInverter(items, user._id);
      const propertyId = items?.isSale === false ? items.propertyId : items?._id;

      const saleData = {
        ownername: items?.ownername?._id,
        metamask_Address: user?.metamask_Address,
        PropertyDes: items?.PropertyDes,
        nftId: items.nftId,
        PropertyAmount: items?.PropertyAmount,
        isFavorite: items?.isFavorite,
        PropertyName: items?.PropertyName,
      };

      let res = await API.post(`/sale/add-saleproperty`, saleData);
      console.log("Sale response:", res);
      toast.success("Property shares sold successfully");

      await getMyPropertyList();
    } catch (error) {
      console.log("Error in selling property shares:", error);
      toast.error("Error in selling property shares");
    }
  };

  const handleOwnerAddressSale = async (items) => {
    try {
      if (!address) {
        toast.error("Wallet not connected");
        return;
      }

      // Determine if user is ownerOneAddress or ownerTwoAddress
      const isOwnerOne = items.ownerOneAddress === address;
      const isOwnerTwo = items.ownerTwoAddress === address;

      if (!isOwnerOne && !isOwnerTwo) {
        toast.error("You are not an owner of this property");
        return;
      }

     
      const { request } = await prepareWriteContract({
        address: Property_Contract_Address,
        abi: Property_Contract_Abi,
        functionName: "sellShare",
        args: [items.nftId, address, 1],
        account: address,
      });

      const { hash } = await writeContract(request);
      console.log("Transaction hash:", hash);
      const data = await waitForTransaction({ hash });
      console.log("Transaction confirmed:", data);

      // Call backend API to update property
      const propertyId = items._id; // Use _id directly
      const saleData = {
        ownerType: isOwnerOne ? "ownerOne" : "ownerTwo",
        userAddress: address, // Include userAddress for verification
      };

      console.log("Sending API request:", {
        endpoint: `/property/property/${propertyId}/sellOwnerShare`,
        data: saleData,
      });

      let res = await API.put(`/property/property/${propertyId}/sellOwnerShare`, saleData);
      console.log("Owner share sale response:", res.data);
      toast.success("Owner share sold successfully");

      await getMyPropertyList();
    } catch (error) {
      console.error("Error in selling owner share:", error);
      toast.error("Error in selling owner share");
    }
  };

  return (
    <div className="homeppage">
      <div className="container-fluid">
        <div className="d-flex justify-content-center d-md-none">
          <div className="position-relative d-md-block">
            <input
              type="text"
              placeholder="Search property"
              className="main_head_df_inp popfont mainclr"
            />
            <IoSearchSharp className="sea_icon mainclr" />
          </div>
        </div>

        <div className="row">
          <div className="col-md-2 d-none d-md-block">
            <SideBar
              side1="Add Property"
              side2="List a Property"
              side3="My Wallet"
              side4="My Assets"
              side5="Favorites"
              side6="Log Out"
              onMenuClick={setSelectedMenu}
            />
          </div>

          <div className="col-md-10">
            <div className="row">
              {listOfProperties.length > 0 ? (
                listOfProperties.map((property) => (
                  <div className="col-md-4 mt-3" key={property._id}>
                    <Property_card
                      {...property}
                      property={property}
                      isFavorited={property.isFavorite}
                      toggleFavorite={() => toggleFavorite(property._id)}
                      type="MyAsset"
                      handleSaleProperty={handleOwnerAddressSale}
                      handleOwnerAddressSale={handleOwnerAddressSale}
                      address={address}
        getMyPropertyList={getMyPropertyList}
                    />
                  </div>
                ))
              ) : (
                <p className="text-center w-100 mt-3">
                  No properties found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}