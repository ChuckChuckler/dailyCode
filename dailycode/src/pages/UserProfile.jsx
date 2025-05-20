import axios from "axios";
import { useState } from "react";
import "./Pages.css";

export default function UserProfile(){
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [status, setStatus] = useState("");
    const [pfp, setPfp] = useState(null);
    const [bio, setBio] = useState("");

    window.onload = function(){
        axios.get("/getUserInfo")
        .then((response)=>{
            setDisplayName(response.data.displayName);
            setUsername(response.data.username);
            setPfp("/getPfp");
            setBio(response.data.bio);
        })
        .catch((e)=>{
            console.log(e);
        });
    }

    return(
        <>
            <button onClick={function(){
                window.location.href = "/home";
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
                window.location.href = "/user-settings";
            }}>Edit Profile</button>
            <br></br>
            <br></br>
            <h2>Projects:</h2>
        </>
    )
}