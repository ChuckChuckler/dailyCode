import axios from "axios";
import { useState, useEffect } from "react";
import "./Pages.css";
import { useParams, useNavigate, data } from "react-router";
import "../comps/ProjectList";
import ProjectList from "../comps/ProjectList";

export default function Profile(){
    const [displayName, changeDisplayName] = useState("");
    const [pfp, changePfp] = useState(null);
    const [bio, changeBio] = useState("");
    const [projects, setProjects] = useState([]);
    const [editProfile, editProfileView] = useState("hidden");

    const navigate = useNavigate();
    const params = useParams();
    const user = params.user;

    useEffect(()=>{
        const loadPage = async () =>{
            let tempProjectsArr = [];
            let projectIds;

            await axios.post("/fetchProfile", {username:user})
            .then((response)=>{
                let data = response.data;

                changeDisplayName(data.displayName);
                changeBio(data.userBio);
                changePfp(`data:${data.pfpMimeType};base64,${data.pfpData.toString("base64")}`);
                projectIds = data.projectIds;

                if(data.selfUser){
                    editProfileView("block");
                }
            })
            .catch((e)=>{
                console.log(e);
            });

            for(let i of projectIds){
                await axios.post("/fetchProject", {id: i})
                .then((response)=>{
                    let data = response.data;
                    tempProjectsArr.unshift({
                        id: i,
                        name: data.name,
                        date: data.date,
                        preview: data.previewFile,
                        votes: data.votes
                    });
                })
                .catch((e)=>{
                    console.log(e);
                })
            }

            setProjects(tempProjectsArr);
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
            <button onClick={function(){
                navigate("/home")
            }}>Return</button>
            <br></br>
            <hr></hr>
            <br></br>
            <div className="flex justify-around">
                <div className="w-[48%] overflow-auto">
                    <h1>{displayName}</h1>
                    <img src={pfp} className="w-[300px] h-[300px] rounded-full"></img>
                    <br></br>
                    <h3>{user}</h3>
                    <h6>Status: </h6>
                    <br></br>
                    <h3>Pronouns: </h3>
                    <br></br>
                    <h3>Bio:</h3>
                    <p>{bio}</p>
                    <br></br>
                    <button className={`${editProfile}`} onClick={function(){
                        navigate("/user-settings");
                    }}>Edit Profile</button>
                </div>

                <div className="w-[48%] overflow-auto">
                    <h1>Projects</h1>
                    {projects.map((data,i)=>(
                        <ProjectList key={i} name={data.name} preview={data.preview} creationdate={data.date} votes={data.votes} id={data.id}></ProjectList>
                    ))}
                </div>
            </div>
        </>
    )
}