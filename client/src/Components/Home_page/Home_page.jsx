/* global BigInt */

import React, { useEffect, useState } from "react";
import SideBar from "../SideBar/SideBar";
import Property_card from "../Property_card/Property_card";
import { IoSearchSharp } from "react-icons/io5";
import { API } from "../../API/API";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

const initialProperties = [];

export default function Home_page({ selectedMenu, setSelectedMenu, search }) {
  const [properties, setProperties] = useState(initialProperties);
  const [listAllProperties, setListAllProperties] = useState([]);
  const { address } = useAccount();
  const user = JSON.parse(localStorage.getItem("user"));

  const toggleFavorite = async (id, favorited) => {
    try {
      let res = await API.put(`property/update-favorite/${id}`, {
        isFavorite: favorited,
      });
      console.log("Favorite response:", res);
      setProperties((prevProperties) =>
        prevProperties.map((property) =>
          property.id === id ? { ...property, isFavorite: !property.isFavorite } : property
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const getAllProperties = async () => {
    try {
      let res = await API.get(`/property/properties?search=${search}`);
      // console.log("Properties response:", res);
      // setListAllProperties(res?.data?.properties || []);
      
          const filteredProperties = (res?.data?.properties || []).filter(
      (property: any) => property.reportList !== true
    );
    setListAllProperties(filteredProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };



  useEffect(() => {
    getAllProperties();
  }, [search]);

  const handleBuyShareProperty = async (items, ownerType) => {
    // This is now just for UI/backend sync, no blockchain transactions
    try {
      console.log("handleBuyShareProperty called for:", items.nftId, ownerType);
      setListAllProperties((prev) =>
        prev.map((p) =>
          p._id === items._id
            ? {
                ...p,
                [ownerType === "owner1" ? "inverter1" : "inverter2"]: { userName: user?.userName },
                [ownerType === "owner1" ? "inverter1Amount" : "inverter2Amount"]: items.PropertyAmount * 0.2,
              }
            : p
        )
      );
      toast.success("Property share updated in UI");
    } catch (error) {
      console.error("Error in handleBuyShareProperty:", error);
      toast.error("Error updating property share");
    }
  };

  const displayedProperties =
    selectedMenu === "Favorites"
      ? properties.filter((property) => property.isFavorite)
      : listAllProperties;

  return (
    <div className="homeppage">
      <div className="container-fluid">
        <div className="d-flex justify-content-center d-md-none">
          <div className="position-relative d-md-block">
            <input
              type="text"
              placeholder="Search property"
              className="main_head_inp popfont mainclr"
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
              {displayedProperties.length > 0 ? (
                displayedProperties.map((property) => (
                  <div className="col-md-4 mt-3" key={property._id}>
                    <Property_card
                      {...property}
                      property={property}
                      isFavorited={property.isFavorite}
                      toggleFavorite={toggleFavorite}
                      type="list"
                      handleBuyShareProperty={handleBuyShareProperty}
                      showInverter={true}
                    />
                  </div>
                ))
              ) : (
                <p className="text-center w-100 mt-3">No properties found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}