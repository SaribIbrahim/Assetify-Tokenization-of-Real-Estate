/* global BigInt */

import React, { useState, useEffect } from "react";
import "./Property_card.css";
import { waitForTransaction, writeContract, prepareWriteContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import { Property_Contract_Abi, Property_Contract_Address, token_abi } from "../../utilies/constant";
import toast from "react-hot-toast";
import { API } from "../../API/API"; // Assuming this is available
import { Modal, Button, Form } from "react-bootstrap";


export default function Property_card({
  property,
  PropertyImage,
  PropertyName,
  PropertyDocument,
  PropertyDes,
  propdes,
  ownername,
  PropertyAmount,
  type,
  handleBuyShareProperty,
  propertyId,
  nftId,
  showInverter = false,
  handleSaleProperty,
  toggleFavorite,
  getMyPropertyList
}) {
  const { address } = useAccount();
  const [isFavorited, setIsFavorited] = useState(property?.isFavorite || false);
  const [isBuying, setIsBuying] = useState(false);
  const [localOwnerOne, setLocalOwnerOne] = useState(property?.ownerOne || false);
  const [localOwnerTwo, setLocalOwnerTwo] = useState(property?.ownerTwo || false);

  const [showModal, setShowModal] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);


   const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  


  const isOwner =
    property.ownerOneAddress === address || property.ownerTwoAddress === address;

 const handleEditPrice = async () => {
    if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      setIsLoading(true);

      // Update the price in the backend
      const updateData = {
        propertyId: property._id,
        newPrice: Number(newPrice),
      };

      await API.put(`/property/property/update-price/${property._id}`, updateData);
      toast.success("Price updated successfully");

   
      if (getMyPropertyList) {
        await getMyPropertyList();
      }

      // Close the modal and reset the input
      setShowModal(false);
      setNewPrice("");
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Failed to update price");
    } finally {
      setIsLoading(false);
    }
  };


  const handleReportSubmit = async () => {
    if (!reportReason || reportReason.trim() === "") {
      toast.error("Please enter a valid report reason");
      return;
    }

    try {
      setIsLoading(true);

      // Update the report reason in the backend
      const updateData = {
        reportReason: reportReason.trim(),
      };

      await API.put(`/property/property/update-report-reason/${property._id}`, updateData);
      toast.success("Report reason submitted successfully");

      // Refresh property list if provided
      if (getMyPropertyList) {
        await getMyPropertyList();
      }

      // Close the modal and reset the input
      setShowReportModal(false);
      setReportReason("");
    } catch (error) {
      console.error("Error submitting report reason:", error);
      toast.error("Failed to submit report reason");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    setLocalOwnerOne(property?.ownerOne || false);
    setLocalOwnerTwo(property?.ownertwo || false);
    console.log("property?.ownerOne", property?.ownerOne, property?.nftId);
  }, [property?.ownerOne, property?.ownertwo]);

  const handelToggleFavorite = (id) => {
    setIsFavorited(!isFavorited);
    toggleFavorite(id, !isFavorited);
  };

  const calculateTwentyPercent = (amount) => {
    return amount * 0.2;
  };

  const buyShare = async (landId, ownerType) => {
    if (isBuying) return; // Prevent re-entry
    setIsBuying(true);
    try {
      console.log("Starting buyShare for landId:", landId, "ownerType:", ownerType);

      const shareAmount = calculateTwentyPercent(property?.PropertyAmount || 0);
      const shareAmountInWei = BigInt(Math.floor(50* 10 ** 18));

      // Approve token spending
      const approval = await prepareWriteContract({
        address: "0x7bBb9b65fc6BEd859bc7F392d07085489E2655C4",
        abi: token_abi,
        functionName: "approve",
        args: [Property_Contract_Address, shareAmountInWei],
        account: address,
      });
      const { hash: approvalHash } = await writeContract(approval.request);
      await waitForTransaction({ hash: approvalHash });
      console.log("Token approval completed:", approvalHash);

      // Buy share
      const config = await prepareWriteContract({
        address: Property_Contract_Address,
        abi: Property_Contract_Abi,
        functionName: "buyShare",
        args: [landId, 1],
        account: address,
      });
      const { hash } = await writeContract(config.request);
      const data = await waitForTransaction({ hash });
      console.log("Buy share transaction completed:", data);

   

      toast.success("Property share successfully bought");
      return data;
    } catch (error) {
      console.error("Error in buyShare:", error);
      toast.error("Error in buying property share");
      throw error;
    } finally {
      setIsBuying(false);
    }
  };

  const handleBuyShareClick = async (property, ownerType) => {
    if (isBuying) return; // Prevent multiple clicks
    try {
      const landId = property?.nftId;
      console.log("handleBuyShareClick triggered - landId:", landId, "ownerType:", ownerType);

      if (landId === undefined || landId === null) {
        throw new Error("Land ID is undefined or null");
      }

      const landIdBigInt = BigInt(landId);
      await buyShare(landIdBigInt, ownerType);
      handleBuyShareProperty(property, ownerType); // Now just for UI/backend sync
    } catch (error) {
      console.error("Error buying share:", error);
    }
  };


 

   const updateOwnerOne = async (propertyId, ownerOneValue, ownerOneAddress) => {
    try {
      const endpoint = `/property/property/${propertyId}/ownerOne`;
      console.log("Calling API at:", endpoint);
  
      const res = await API.put(endpoint, {
        ownerOne: ownerOneValue,
        ownerOneAddress: ownerOneAddress,
      });
  
      console.log("ownerOne update response:", res.data);
      toast.success("Owner One updated successfully");
      return res.data;
    } catch (error) {
      console.error("Error updating ownerOne:", error);
      toast.error("Failed to update Owner One");
      throw error;
    }
  };

  const updateOwnerTwo = async (propertyId, ownerTwoValue, ownerTwoAddress) => {
    try {
      const endpoint = `/property/property/${propertyId}/ownerTwo`;
      console.log("Calling API at:", endpoint);
  
      console.log("address", address)
      const res = await API.put(endpoint, {
        ownerTwo: ownerTwoValue,
        ownerTwoAddress: ownerTwoAddress,
      });
  
      console.log("ownerTwo update response:", res.data);
      toast.success("Owner Two updated successfully");
      return res.data;
    } catch (error) {
      console.error("Error updating ownerTwo:", error);
      toast.error("Failed to update Owner Two");
      throw error;
    }
  };



  return (
    <div className="property-card">
      <div className="feature_card" style={{ boxShadow: "0px 10px 20px 0px #100A551A" }}>
        <div className="position-relative">
          <img src={PropertyImage} className="feature_img" alt="" />
          <div
            className="heart_icon"
            onClick={() => handelToggleFavorite(property?._id)}
            style={{ cursor: "pointer" }}
          >
            <i
              className={`fa-${isFavorited ? "solid" : "regular"} fa-heart fs-22`}
              style={{ color: isFavorited ? "red" : "#7065F0" }}
            />
          </div>
         
           <div
            className="reportIcon"
            onClick={() => setShowReportModal(true)}
            style={{ cursor: "pointer" }}
          >
            <i
              className={`fa fa-flag fs-22`}
             
            />
          </div>
        </div>
        <div className="feature_card_content px-3 py-2">
          <div className="d-flex justify-content-between align-items-center my-2">
            <h6 className="popfont mb-0 fs-5 fw-semibold">{PropertyName}</h6>
            <a href={PropertyDocument} target="_blank" rel="noopener noreferrer">
              <button className="prop_dou popfont fs-6 fw-normal">Property Doc</button>
            </a>
          </div>
          <div className="d-flex justify-content-between align-items-center my-2">
            <p className="popfont mb-0 fs-6">{PropertyDes}</p>
          </div>
          <p className="popfont mb-0 fs-6 fw-normal mainclr text-truncate">{propdes}</p>
          <div className="d-flex align-items-center justify-content-between">
            <p className="fs-6 popfont mb-0" style={{ color: "#7065F0" }}>Owner</p>
            <p className="text_clr fs-16 fw-400 popfont mb-0">{ownername?.userName}</p>
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <p className="fs-6 popfont mb-0" style={{ color: "#7065F0" }}>Price</p>
            <p className="text_clr fs-16 fw-400 popfont mb-0">{PropertyAmount}</p>
          </div>
          {showInverter && property?.isSale !== true && (
            <>
              <div className="d-flex align-items-center justify-content-between">
                <p className="fs-6 popfont mb-0" style={{ color: "#7065F0" }}>
                  {property?.inverter1?.userName || "Owner 1"}
                </p>
                <button
                  className={`prop_dou popfont fs-6 fw-normal ${property?.ownerOne ? "disabled" : ""}`}
                  disabled={
                    isBuying ||
                    property?.inverter1?.userName ||
                    property?.metamask_Address === address ||
                    localOwnerOne 
                  }
                  
                  style={{
                    opacity:
                      property?.inverter1?.userName || property?.metamask_Address === address
                        ? "0.6"
                        : "",
                  }}
            //       onClick={() => handleBuyShareClick(property, "owner1")}
            //  onClick={() => updateOwnerOne(property?._id, !property?.ownerOne)}
            onClick={() => {
              handleBuyShareClick(property, "owner1");
              updateOwnerOne(property?._id, !property?.ownerOne, address);
            }}
                >
                  {isBuying ? "Buying..." : "Buy Share"}
                </button>
                <p className="text_clr fs-16 fw-400 popfont mb-0">
                  {property?.inverter1Amount || 0}
                </p>
              </div>
              <div className="d-flex my-1 align-items-center justify-content-between">
                <p className="fs-6 popfont mb-ExecuteHandler mb-0" style={{ color: "#7065F0" }}>
                  {property?.inverter2?.userName || "Owner 2"}
                </p>
                <button
                  className={`prop_dou popfont second_on fs-6 fw-normal ${property?.ownerTwo ? "disabled" : ""}`}
                  disabled={
                    isBuying ||
                    property?.inverter2?.userName ||
                    property?.metamask_Address === address
        
                  }
                  style={{
                    opacity:
                      property?.inverter2?.userName || property?.metamask_Address === address
                        ? "0.6"
                        : "",
                  }}
                  // onClick={() => handleBuyShareClick(property, "owner2")}
                  // onClick={() => updateOwnerTwo(property?._id, !property?.ownerTwo)}
                  onClick={() => {
                    handleBuyShareClick(property, "owner2");
                    updateOwnerTwo(property?._id, !property?.ownerTwo, address);
                  }}
                >
                  {isBuying ? "Buying..." : "Buy Share"}
                </button>
                <p className="text_clr fs-16 fw-400 popfont mb-0">
                  {property?.inverter2Amount || 0}
                </p>
              </div>
            </>
          )}
          {(property?.inverter1Sale || property?.inverter2Sale || property?.isSale === false || property.ownerOne || property.ownerTwo) &&
            handleSaleProperty && (
              <button
                className="head_btn popfont mb-0 text-white mt-3 w-100"
                onClick={() => handleSaleProperty(property)}
              >
                Sell this property
              </button>
            )}
            {property?.metamask_Address === address && (
        <button onClick={() => setShowModal(true)} className="edit-price-btn prop_dou">
          Edit Price
        </button>
      )}
          {property?.isSale === true && (
            <button
              className="head_btn popfont mb-0 text-white mt-3 w-100"
              onClick={() => handleBuyShareClick(property, "owner1")}
              disabled={property?.metamask_Address === address || isBuying}
              style={{
                opacity: property?.metamask_Address === address ? "0.6" : "",
              }}
            >
              {isBuying ? "Buying..." : "Buy this Share"}
            </button>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Property Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPrice">
              <Form.Label>New Price (ETH)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Enter new price"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="prop_dou" variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            className="prop_dou"
            onClick={handleEditPrice}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Price"}
          </Button>
        </Modal.Footer>
      </Modal>

       {showReportModal && (
        <div className="modal" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="modal-content" style={{ background: "white", padding: "20px", borderRadius: "5px", width: "400px" }}>
            <h2>Report Property</h2>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Enter reason for reporting this property"
              style={{ width: "100%", height: "100px", marginBottom: "10px" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setShowReportModal(false)} disabled={isLoading} className="prop_dou">
                Cancel
              </button>
              <button onClick={handleReportSubmit} disabled={isLoading} className="prop_dou">
                {isLoading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}