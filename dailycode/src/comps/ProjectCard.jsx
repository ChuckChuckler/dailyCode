import { useState } from "react";
import "../pages/Pages.css";
import axios from "axios";

export default function ProjectCard({ creator, creatorPfp, name, preview, id, votes }){
    const [acVotes, updateVotes] = useState(votes);
    
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
                    axios.post("/updateVotes", {id: id, votes:acVotes, status: "upvote"})
                    .then((response)=>{
                        updateVotes(response.data);
                    })
                    .catch((e)=>{
                        console.log(e);
                    });
                }}>Upvote</button>
                <h2 id="votes">{acVotes}</h2>
                <button onClick={function(){
                    axios.post("/updateVotes", {id: id, votes:acVotes, status: "downvote"})
                    .then((response)=>{
                        updateVotes(response.data);
                    })
                    .catch((e)=>{
                        console.log(e);
                    });
                }}>Downvote</button>
            </div>
            <br></br>
        </div>
    )
}
