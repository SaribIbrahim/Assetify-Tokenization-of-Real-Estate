/* global BigInt */

import React, { useEffect, useState } from "react";
import SideBar from "../SideBar/SideBar";
import Property_card from "../Property_card/Property_card";
import { IoSearchSharp } from "react-icons/io5";
import { API } from "../../API/API";
import toast from "react-hot-toast";

export default function Favorite({ selectedMenu, setSelectedMenu }) {
  const [listOfProperties, setListOfProperties] = useState([]);

  const getMyPropertyList = async () => {
    try {
      let res = await API.get(`/property/properties`);
      const propertiesDataArray = res?.data?.properties || [];
      setListOfProperties(propertiesDataArray);
    } catch (error) {
      console.log("Error fetching properties:", error);
      toast.error("Failed to load properties");
    }
  };

  useEffect(() => {
    getMyPropertyList();
  }, []);

  return (
    <div className="homepage">
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
                listOfProperties
                  .filter((property) => property.isFavorite === true)
                  .map((property) => (
                    <div className="col-md-4 mt-3" key={property._id}>
                      <Property_card
                        {...property}
                        property={property}
                        isFavorited={property.isFavorite}
                        type="MyAsset"
                      />
                    </div>
                  ))
              ) : (
                <p className="text-center w-100 mt-3">
                  No favorite properties found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}