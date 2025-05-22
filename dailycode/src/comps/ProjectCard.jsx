import { useState } from "react";
import "../pages/Pages.css";

export default function ProjectCard({ name, preview }){
    return(
        <div>
            <h1>{name}</h1>
            <img src={preview} className="w-[150px] h-[150px] object-cover object-center"></img>
        </div>
    )
}
