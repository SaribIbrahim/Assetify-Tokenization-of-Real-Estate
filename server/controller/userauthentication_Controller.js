const Forot_Password_OTP = require("../models/OTP_Model");
const Userauthentication_Model = require("../models/Userauthentication_Model");

const bcrypt = require('bcrypt');
const sendEmail = require("../sendEmail");

exports.admin_register = async (request, response) => {
    try {
        const {
            email,
            password,
            userName,
            metamask_Address
        } = request.body
        let LogIn_data = await Userauthentication_Model.find({

            email: {
                $regex: email,
                $options: "i"
            }
        })

        let UserName_LogIn_data = await Userauthentication_Model.find({
            userName: {
                $regex: userName,
                $options: "i"
            }
        })
        let metamask_Address_data = await Userauthentication_Model.find({
            metamask_Address: {
                $regex: metamask_Address,
                $options: "i"
            }
        })
        console.log("LogIn_data.length", metamask_Address_data.length);
        if (UserName_LogIn_data.length != 0 || LogIn_data.length != 0 || metamask_Address_data.length != 0) {
            response.status(201).send({
                data: [],
                success: false,
                msg: UserName_LogIn_data.length != 0 ? " This UserName Already Registor" : LogIn_data.length != 0 ? "This Email Already Registor" : "This Metamask Address Already Registor"


            })
        } else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password.toString(), salt);
            request.body.password = hash

            const data = new Userauthentication_Model(request.body)
            console.log("Data", data);
            await data.save()
            response.status(201).send({
                data: data,
                success: true,
                msg: "Thank you for registration"
            })
        }

    } catch (e) {
        console.log(e);
    }
}

exports.admin_login = async (request, response) => {
    try {
        const { email, password, metamask_Address } = request.body;
        // Validate the input
        if (!email || !password || !metamask_Address) {
            return response.status(400).send({
                success: false,
                msg: "All fields are required.",
            });
        }

        // Find the matching user in the database
        const user = await Userauthentication_Model.findOne({
            email: {
                $regex: email,
                $options: "i",
            },
        });

        if (!user) {
            // If user is not found, return error response
            return response.status(404).send({
                success: false,
                msg: "User not found.",
            });
        }

        // Check if MetaMask address matches
        if (user.metamask_Address?.toLowerCase() !== metamask_Address?.toLowerCase()) {
            return response.status(200).send({
                success: false,
                msg: "MetaMask address does not match.",
            });
        }

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // If passwords don't match, return error response
            return response.status(200).send({
                success: false,
                msg: "Invalid password.",
            });
        }

        // Login successful
        response.status(200).send({
            data: user,
            success: true,
            msg: "Login successful.",
        });
    } catch (e) {
        console.error(e);
        response.status(500).send({
            success: false,
            msg: "An error occurred. Please try again later.",
        });
    }
};



exports.changePassword = async (req, res) => {
    try {
        const {
            email
        } = req.params;

        const {
            oldPassword,
            newPassword
        } = req.body;

        //find the user from database
        console.log("user", email);
        const user = await Userauthentication_Model.findOne({
            email: email
        });
        if (!user) {
            return res.status(201).send({
                message: 'User not found'
            });
        }

        //compare the old password with the one saved in database
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(201).send({
                message: 'Old password is incorrect'
            });
        }

        //generate new password hash
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        //update user with the new password hash
        await Admin_login.updateOne({
            email: email
        }, {
            password: hash
        });

        return res.status(200).send({
            message: 'Password changed successfully'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error'
        });
    }
}


exports.sendOTP = async (req, res) => {
    try {
        const {
            email,
        } = req.body

        const user = await Userauthentication_Model.findOne({
            email
        });

        if (!user) {
            // If user is not found, return error response
            return res.status(201).send({
                success: false,
                msg: "User not found."
            })

        } else {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const send_to = email;
            const sent_from = "contact@newsflow.io";
            const reply_to = email;
            const subject = "OTP Verification";
            const message = `
                <div style="font-size: .8rem; margin: 0 30px;background-color: #2d1567;
                    color: #fff;padding:27px 0;
                    text-align: center;">

                    <h1>OTP Request</h1>

                          </div>
                          <h3 style="text-align: center" > This is the one time code -  <strong>${otp} </strong>  </h3>
                    `;
            await sendEmail(subject, message, send_to, sent_from, reply_to);
            req.body.otp = otp
            const LogIn_data = await Forot_Password_OTP.find({
                email: email,
            })

            if (LogIn_data.length !== 0) {

                await Forot_Password_OTP.updateOne({
                    email: email
                }, {
                    otp: otp
                });
                res.status(201).send({
                    success: true,
                    msg: `Email has been sent to ${email}`
                })
            } else {
                const data = new Forot_Password_OTP(req.body)
                console.log("Data", data);
                await data.save()
                res.status(201).send({

                    success: true,
                    msg: `Email has been sent to ${email}`
                })
            }
        }




    } catch (error) {
        console.log("Error while sending mail from base .", error);
        res.send(error.message);
    }
}




exports.VarifyOTP = async (req, res) => {

    try {
        const { code, email } = req.body
        const data = await Forot_Password_OTP.find({
            email: email
        })
        console.log("data", data);
        if (!data) {
            res.send({
                success: false,
                msg: "OTP verification failed"
            })
        } else {

            const [{ otp }] = data
            console.log("Data", otp);
            if (otp == code) {

                res.send({
                    success: true,
                    msg: "OTP verification succeeded"
                })
            } else {
                res.send({
                    success: false,
                    msg: "OTP verification failed"
                })
            }
        }



    } catch (error) {
        console.log(error);
    }


}


exports.forgotPassword = async (req, res) => {
    try {
        const {
            email
        } = req.params;

        const {
            newPassword
        } = req.body;

        //find the user from database
        console.log("user", email);
        const user = await Userauthentication_Model.findOne({
            email: email
        });
        if (!user) {
            return res.status(201).send({
                success: false,
                msg: 'User not found'
            });
        }
        //generate new password hash
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        //update user with the new password hash
        await Userauthentication_Model.updateOne({
            email: email
        }, {
            password: hash
        });

        return res.status(200).send({
            success: true,
            msg: 'Your New Password Update successfully'
        });
    } catch (err) {
        console.error(err);
        return res.status(200).send({
            success: false,
            msg: 'Internal server error'
        });
    }
}