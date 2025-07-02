import React from 'react';

import "./AdminPannel.css";
import SideBar from '../SideBar/SideBar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { barChartData } from "./ChartDATA";
import p1 from "../Assets/p1.png"
import p2 from "../Assets/p2.png"
import p3 from "../Assets/p3.png"
import p4 from "../Assets/p4.png"
import { IoSearchSharp } from 'react-icons/io5'
import Property_card from '../Property_card/Property_card';




const properties = [
    { prophead: "1 kanal", propimg: p1, propamount: "10M", propdes: "Model Town Q Block street no. 5, Lahore", firstownershare: "30%", secondownershare: "10%", ownername: "Tayyab Arain" },
    { prophead: "5 marla", propimg: p2, propamount: "2.5M", propdes: "Gulberg III, Block F, Lahore", firstownershare: "25%", secondownershare: "15%", ownername: "Ali Khan" },
    { prophead: "10 marla", propimg: p3, propamount: "6M", propdes: "DHA Phase 5, Sector C, Lahore", firstownershare: "20%", secondownershare: "20%", ownername: "Usman Tariq" },
    { prophead: "1 kanal", propimg: p4, propamount: "12M", propdes: "Bahria Town, Sector B, Lahore", firstownershare: "30%", secondownershare: "10%", ownername: "Sara Ahmed" },
    { prophead: "7 marla", propimg: p1, propamount: "4.5M", propdes: "Wapda Town, Block A2, Lahore", firstownershare: "25%", secondownershare: "15%", ownername: "Naveed Riaz" },
    { prophead: "15 marla", propimg: p2, propamount: "8M", propdes: "Johar Town, Block H, Lahore", firstownershare: "30%", secondownershare: "10%", ownername: "Tayyab Arain" },
];

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
);

export default function AdminPannel() {
    const options = {};
    return (
        <div className='admin_pannel_main'>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2 d-none d-md-block">
                        <SideBar side1="increment Approval" side2="Reported Accounts" side3=" My Assets" side4="Favorites" side5
                        ="Log Out" />
                    </div>

                    <div className="col-md-10">
                        <div className="row align-items-center">
                            <div className="col-md-7 order-1 order-md-0">
                                
                                    <Bar options={options} className='bar w-100' data={barChartData} />
                                </div>
                                <div className="col-md-5 order-0 order-md-1">
                                    <div className='d-flex justify-content-between align-items-center'>
                                        <h5 className='intfont fw-semibold fs-5 mainclr'>Total Users:</h5> <p className='popfont fw-bold mainclr fs-5 '>120</p>
                                    </div>
                                    <div className='d-flex justify-content-between align-items-center'>
                                        <h5 className='intfont fw-semibold fs-5 mainclr'>Properties listed:</h5> <p className='popfont fw-bold mainclr fs-5 '>1,120</p>
                                    </div>
                                </div>
                            </div>



                            <div className="row mt-5">
                    {properties.map((property, index) => (
                    <div className="col-md-4 mt-3">
            <Property_card 
                key={index}
                ownername={property.ownername}
                prophead={property.prophead}
                propimg={property.propimg}
                propamount={property.propamount}
                propdes={property.propdes}
                firstownershare={property.firstownershare}
                secondownershare={property.secondownershare}
            />
              </div>
        ))}
                    </div>
                    <div className='d-flex justify-content-center mt-3'>
            <button className='head_btn w-50 popfont fw-semibold'>Load More</button>
        </div>
                        </div>
                    </div>

                    
                </div>
            </div>
      
    );
}
