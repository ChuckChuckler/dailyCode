import { useState, useEffect } from "react";
import "../pages/Pages.css";
import axios from "axios";
import { useNavigate } from "react-router";

export default function ProjectCard({ creator, creatorPfp, name, preview, id, votes, voteStatus, ownProject }){
    const [acVotes, updateVotes] = useState(votes);
    const [upvoteColor, changeUpvoteColor] = useState("white");
    const [downvoteColor, changeDownvoteColor] = useState("white");
    const [votingDisplay, displayVotingInterface] = useState("block");
    const [votesDisplay, displayOwnProject] = useState("hidden");

    const navigation = useNavigate();

    useEffect(()=>{
        const setAll = () => {
            if(voteStatus == "upvote"){
                changeUpvoteColor("[#979899]");
            }else if(voteStatus == "downvote"){
                changeDownvoteColor("[#979899]");
            }else{
                changeUpvoteColor("white");
                changeDownvoteColor("white");
            }

            if(ownProject){
                displayOwnProject("block");
                displayVotingInterface("hidden");
            }else{
                displayOwnProject("hidden");
                displayVotingInterface("block");
            }
        };

        if(document.readyState == "complete"){
            setAll();
        }else{
            window.addEventListener("load", setAll);
        }

        return()=>window.removeEventListener("load", setAll);
    }, []);
    
    return(
        <div className="bg-[#d4d4d4] w-[300px]">
            <div className="bg-[#a6a6a6] flex h-[35px]">
                <img src={creatorPfp} className="w-[30px] h-[30px] rounded-full"></img>
                <h5>{creator}</h5>
            </div>
            <div className="m-auto w-[250px]">
                <h1>{name}</h1>
                <img src={preview} className="w-[250px] h-[250px] object-cover object-center" onClick={function(){
                    navigation(`/project/${id}`);
                }}></img>
            </div>
            <br></br>
            <div className={`${votingDisplay} flex justify-around`}>
                <button className={`bg-${upvoteColor}`} onClick={function(){
                    axios.post("/updateVotes", {id: id, votes:acVotes, status: "upvote"})
                    .then((response)=>{
                        updateVotes(response.data.newVotes);
                        changeUpvoteColor(response.data.color);
                        changeDownvoteColor("white");
                    })
                    .catch((e)=>{
                        console.log(e);
                    });
                }}>Upvote</button>
                <h2 id="votes">{acVotes}</h2>
                <button className={`bg-${downvoteColor}`} onClick={function(){
                    axios.post("/updateVotes", {id: id, status: "downvote"})
                    .then((response)=>{
                        updateVotes(response.data.newVotes);
                        changeDownvoteColor(response.data.color);
                        changeUpvoteColor("white");
                    })
                    .catch((e)=>{
                        console.log(e);
                    });
                }}>Downvote</button>
            </div>
            <div className={`${votesDisplay} flex justify-around`}>
                <h2 id="votes">Votes: {acVotes}</h2>
            </div>
            <br></br>
        </div>
    )
}
