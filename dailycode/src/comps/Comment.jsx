import { useState, useEffect } from "react";
import "../pages/Pages.css";
import axios from "axios";
import { useNavigate } from "react-router";

export default function Comment( {commenter, pfp, date, commentTxt, displayname} ){
    const navigate = useNavigate();
    return(
        <div className="flex">
            <img src={pfp} className="w-[30px] h-[30px] rounded-full" onClick={function(){
                navigate(`/profile/${commenter}`);
            }}></img>
            <div>
                <h3>{displayname} • {date}</h3>
                <h2>{commentTxt}</h2>
            </div>
        </div>
    )
}