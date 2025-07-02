/* global BigInt */


import React, { useEffect, useState } from "react";
import axios from "axios";
import SideBar from "../SideBar/SideBar";
import { API } from "../../API/API";
import { useAccount } from "wagmi";
import {
  prepareWriteContract,
  waitForTransaction,
  writeContract,
} from "@wagmi/core";
import { Property_Contract_Abi, Property_Contract_Address } from "../../utilies/constant";
import toast from "react-hot-toast";
import { ethers } from "ethers";

const AddProperty = ({ setSelectedMenu }) => {
  const [formData, setFormData] = useState({
    PropertyName: "",
    PropertyImage: null,
    PropertyDocument: null,
    PropertyAmount: "",
    PropertyDes: "",
    ownername: "",
    metamask_Address: null,
    isFavorite: false,
  });
  const { address } = useAccount();
  const [spinner, setSpinner] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (value.trim() || (type === "checkbox" && checked)) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const { name } = e.target;

    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          [name]: "File size must be less than 2MB.",
        }));
        return;
      }
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Only JPEG and PNG images are allowed.",
        }));
        return;
      }
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    setFormData({
      ...formData,
      [name]: file,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.PropertyName) newErrors.PropertyName = "Property name is required.";
    if (!formData.PropertyAmount || isNaN(formData.PropertyAmount) || Number(formData.PropertyAmount) <= 0) {
      newErrors.PropertyAmount = "Property amount must be a positive number.";
    }
    if (!formData.PropertyDes) newErrors.PropertyDes = "Property description is required.";
    if (!formData.metamask_Address) newErrors.metamask_Address = "Connect Wallet First";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    console.log("hitting")
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setSpinner(true);

    try {
      const amountInWei = ethers.parseEther(formData.PropertyAmount.toString());
      const { request } = await prepareWriteContract({
        address: Property_Contract_Address,
        abi: Property_Contract_Abi,
        functionName: "listLand",
        args: [formData.PropertyName, amountInWei],
        account: address,
      });
      const { hash } = await writeContract(request);
      const receipt = await waitForTransaction({ hash });

      console.log("Transaction Receipt:", receipt);
      console.log("Logs:", receipt.logs);

      // Find the LandListed event (adjust based on actual event signature)
      let nftId;
      const landListedLog = receipt.logs.find(log => 
        log.topics[0] === "0x2e22ba2443b3b9f2fdefc90415dac276989216eee9f55f04f0842846bf9d9a20"
      );

      if (landListedLog) {
        // Decode data manually since ABI might not match
        const decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
          ["uint256", "string", "uint256"], // tokenId, name, totalValue
          landListedLog.data
        );
        nftId = decodedData[0].toString();
        console.log("Decoded Data:", decodedData);
      } else {
        // Fallback: Use Transfer event if LandListed isn’t found
        const transferLog = receipt.logs.find(log => 
          log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        );
        if (transferLog) {
          nftId = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], transferLog.topics[3])[0].toString();
        } else {
          throw new Error("Could not find LandListed or Transfer event in receipt.");
        }
      }

      const formDataToSend = new FormData();
      formDataToSend.append("PropertyName", formData.PropertyName);
      formDataToSend.append("PropertyAmount", formData.PropertyAmount);
      formDataToSend.append("PropertyDes", formData.PropertyDes);
      formDataToSend.append("ownername", user._id);
      formDataToSend.append("isFavorite", formData.isFavorite);
      formDataToSend.append("metamask_Address", address);
      formDataToSend.append("nftId", nftId);
      console.log("Extracted nftId:", nftId);
      if (formData.PropertyImage) formDataToSend.append("PropertyImage", formData.PropertyImage);
      if (formData.PropertyDocument) formDataToSend.append("PropertyDocument", formData.PropertyDocument);

      const response = await axios.post("http://localhost:3300/property/add-saleproperty", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Response from server:", response.data);

      toast.success("Property added successfully");
      setFormData({
        PropertyName: "",
        PropertyImage: null,
        PropertyDocument: null,
        PropertyAmount: "",
        PropertyDes: "",
        ownername: "",
        metamask_Address: null,
        isFavorite: false,
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error(`Failed to add property: ${error.message}`);
    } finally {
      setSpinner(false);
    }
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, metamask_Address: address || "" }));
  }, [address]);

  return (
    <div className="py-5">
      <div className="container-fluid">
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
            <form onSubmit={handleSubmit} className="property-form">
              <h2 className="fs-2 intfont fw-bold mainclr text-center">Property Form</h2>
              <label>
                Property Title:
                <input
                  type="text"
                  name="PropertyName"
                  value={formData.PropertyName}
                  placeholder="Enter property Title"
                  onChange={handleChange}
                  className="reg_input popfont mainclr fw-semibold mt-2 w-100"
                />
                {errors.PropertyName && <small className="text-danger">{errors.PropertyName}</small>}
              </label>
              <br />
              <label className="mt-3">
                Property Image:
                <input type="file" accept="image/*" name="PropertyImage" onChange={handleFileUpload} />
                {errors.PropertyImage && <small className="text-danger">{errors.PropertyImage}</small>}
              </label>
              <br />
              <label className="mt-3">
                Property Document:
                <input type="file" accept="image/*" name="PropertyDocument" onChange={handleFileUpload} />
                {errors.PropertyDocument && <small className="text-danger">{errors.PropertyDocument}</small>}
              </label>
              <br />
              <label className="mt-3">
                Property Amount (in BNB):
                <input
                  type="text"
                  name="PropertyAmount"
                  value={formData.PropertyAmount}
                  onChange={handleChange}
                  className="reg_input popfont mainclr fw-semibold mt-2 w-100"
                  placeholder="Enter Property Amount"
                />
                {errors.PropertyAmount && <small className="text-danger">{errors.PropertyAmount}</small>}
              </label>
              <br />
              <label className="mt-3">
                Property Description:
                <input
                  type="text"
                  name="PropertyDes"
                  value={formData.PropertyDes}
                  onChange={handleChange}
                  className="reg_input popfont mainclr fw-semibold mt-2 w-100"
                  placeholder="Enter Property Description"
                />
                {errors.PropertyDes && <small className="text-danger">{errors.PropertyDes}</small>}
              </label>
              <br />
              <label className="mt-3">
                Favorite:
                <input
                  type="checkbox"
                  name="isFavorite"
                  checked={formData.isFavorite}
                  onChange={handleChange}
                />
              </label>
              <br />
              <label className="mt-3">
                {errors.metamask_Address && <small className="text-danger">{errors.metamask_Address}</small>}
              </label>
              <button
                className="login_btn mt-2 popfont fw-300"
                style={{ color: "#F1F0FE" }}
                type="submit"
                disabled={spinner}
              >
                {spinner ? "Loading..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;