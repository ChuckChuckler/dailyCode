import { useState, useEffect } from "react";
import "../pages/Pages.css";
import axios from "axios";
import { useNavigate } from "react-router";

export default function ProjectList( {name, preview, creationdate, votes, id} ){
    const navigate = useNavigate();

    return(
        <div onClick={function(){
            navigate(`/project/${id}`);
        }}>
            <img src={preview} className="w-[200px] h-[200px] object-cover object-center"></img>
            <div>
                <h2>{name}</h2>
                <h3>{creationdate}</h3>
            </div>
            <h2>{votes} votes</h2>
        </div>
    )
}