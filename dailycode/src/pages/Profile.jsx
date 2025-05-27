import axios from "axios";
import { useState, useEffect } from "react";
import "./Pages.css";
import { useParams, useNavigate, data } from "react-router";

export default function Profile(){
    const [displayName, changeDisplayName] = useState("");
    const [pfp, changePfp] = useState(null);
    const [bio, changeBio] = useState("");
    const [projects, setProjects] = useState([]);

    const navigate = useNavigate();
    const params = useParams();
    const user = params.user;

    useEffect(()=>{
        const loadPage = () =>{
            axios.post("/fetchProfile", {username:user})
            .then((response)=>{
                let data = response.data;
                changeDisplayName(data.displayName);
                changeBio(data.userBio);
                changePfp(`data:${data.pfpMimeType};base64,${data.pfpData.toString("base64")}`)
                setProjects(data.projects);
            })
            .catch((e)=>{
                console.log(e);
            });
        };

        if(document.readyState=="complete"){
            loadPage();
        }else{
            window.addEventListener("load", loadPage);
        }

        return()=>window.removeEventListener("load", loadPage);
    }, []);

    return(
        <>
            <div className="flex justify-around">
                <div className="w-[48%]">
                    <div className="flex justify-around w-[60%]">
                        <img src={pfp} className="w-[100px] h-[100px] rounded-full"></img>
                        <div>
                            <h1>{displayName}</h1>
                            <h3>{user}</h3>
                        </div>
                    </div>
                    <br></br>
                    <h3>Pronouns: </h3>
                    <br></br>
                    <h3>Bio:</h3>
                    <p>{bio}</p>
                </div>
                <div className="w-[48%]">
                    <h1>Projects</h1>
                    {projects.map((data,i)=>(
                        <h2 key={i}>{data}</h2>
                    ))}
                </div>
            </div>
        </>
    )
}