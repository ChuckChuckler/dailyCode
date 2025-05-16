import axios from "axios";
import { useState } from "react";
import "./Pages.css";

export default function Home(){
    const [displayname, setDisplayName] = useState("");
    const [pfp, setPfp] = useState(null);

    window.onload = function(){
        axios.get("/getUserInfo")
        .then((response)=>{
            setDisplayName(response.data.displayName);
        })
        .catch((e)=>{
            console.log(e);
        })

        setPfp("/getPfp");
    }

    return(
        <>
            <img src={pfp} className="w-[100px] h-[100px] rounded-full" onClick={function(){
                window.location.href = "/user-profile";
            }}></img>
            <h1>Good to see you, {displayname}!</h1>
        </>
    )
}