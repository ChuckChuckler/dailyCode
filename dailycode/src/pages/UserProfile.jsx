import axios from "axios";
import { useState, useEffect } from "react";
import "./Pages.css";
import { useNavigate } from "react-router";

export default function UserProfile(){
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [status, setStatus] = useState("");
    const [pfp, setPfp] = useState(null);
    const [bio, setBio] = useState("");

    const navigate = useNavigate();

    useEffect(()=>{
        const loadSelf = () =>{
            axios.get("/getUserInfo")
            .then((response)=>{
                if(response.data.msg == "home"){
                    navigate("/");
                }else{
                    setDisplayName(response.data.displayName);
                    setUsername(response.data.username);
                    setPfp(response.data.pfp);
                    setBio(response.data.bio);
                }
            })
            .catch((e)=>{
                console.log(e);
            });
        };

        if(document.readyState == "complete"){
            loadSelf();
        }else{
            window.addEventListener("load", loadSelf);
        }

        return()=>window.removeEventListener("load", loadSelf);
    }, []);

    return(
        <>
            <button onClick={function(){
                navigate("/home");
            }}>back home</button>
            <br></br>
            <br></br>
            <h1>{displayName}</h1>
            <img src={pfp} className="w-[300px] h-[300px] rounded-full"></img>
            <h3>{username}</h3>
            <h6>{status}</h6>
            <h5>Bio</h5>
            <p>{bio}</p>
            <br></br>
            <button onClick={function(){
                navigate("/user-settings");
            }}>Edit Profile</button>
            <br></br>
            <br></br>
            <h2>Projects:</h2>
        </>
    )
}