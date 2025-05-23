import { useState } from "react";
import "../pages/Pages.css";

export default function ProjectCard({ creator, creatorPfp, name, preview, id }){
    return(
        <div className="bg-[#d4d4d4] w-[300px]" onClick={function(){
            console.log({id});
        }}>
            <div className="bg-[#a6a6a6] flex h-[35px]">
                <img src={creatorPfp} className="w-[30px] h-[30px] rounded-full"></img>
                <h5>{creator}</h5>
            </div>
            <div className="m-auto w-[250px]">
                <h1>{name}</h1>
                <img src={preview} className="w-[250px] h-[250px] object-cover object-center"></img>
            </div>
            <br></br>
            <div className="flex justify-around">
                <button onClick={function(){
                    console.log({id});
                }}>Upvote</button>
                <button onClick={function(){
                    console.log({id});
                }}>Downvote</button>
            </div>
            <br></br>
        </div>
    )
}
