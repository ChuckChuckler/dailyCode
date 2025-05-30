import axios from "axios";
import { useState, useEffect } from "react";
import "./Pages.css";
import { useNavigate, useParams } from "react-router";

export default function Verification(){
    const params = useParams();
    let user = params.user;

    const navigate = useNavigate();

    useEffect(()=>{
        const verifyUser = async() =>{
            await axios.post("/verify", {user:user})
            .then((response)=>{
                console.log("euge!");
            })
            .catch((e)=>{
                console.log(e);
            });
        };

        if(document.readyState=="complete"){
            verifyUser();
        }else{
            window.addEventListener("load", verifyUser);
        }

        return()=>window.removeEventListener("load", verifyUser);
    }, []);

    return(
        <>
            <h1>You've been verified!</h1>
            <h2>You can now receive updates and can reset your password if you forget it.</h2>
            <br></br>
            <button onClick={function(){
                navigate("/");
            }}>Go to sign up/login page</button>
        </>
    )
}