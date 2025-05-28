import axios from "axios";
import { useState, useEffect } from "react";
import "./Pages.css";
import { useNavigate } from "react-router";

let globalPfpFile;
let unsaved = false;

export default function UserSettings(){
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [imgDisplay, changeImgDisplay] = useState("block");
    const [pfp, setPfp] = useState(null);
    const [imgErr, writeImgError] = useState("");
    const [bio, setBio] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [checkDisplay, doublecheck] = useState("hidden");
    const [button, buttonDisplay] = useState("block");

    const navigate = useNavigate();

    useEffect(()=>{
        const loadSelf = () => {
            axios.get("/getUserInfo")
            .then((response)=>{
                if(response.data.msg == "home"){
                    navigate("/");
                }else{
                    setDisplayName(response.data.displayName);
                    setPfp(response.data.pfp);
                    setBio(response.data.bio);
                    setUsername(response.data.username);
                    setPronouns(response.data.pronouns);
                }
            })
            .catch((e)=>{
                console.log(e);
            });
        };

        if(document.readyState == "complete"){
            loadSelf();
        }else{
            window.addEventListener("load", loadSelf);
        }

        return()=>window.removeEventListener("load", loadSelf);
    }, []);

    function saveCheck(){
        if(unsaved){
           doublecheck("block");
           buttonDisplay("hidden");
        }else{
            navigate(`/profile/${username}`); 
        }
    }

    function save(){
        let newDisplayName = document.getElementById("displayName").value;
        let pronouns = document.getElementById("pronouns").value;
        let newBio = document.getElementById("bio").value;

        if(newDisplayName.length == 0){
            newDisplayName = displayName;
            document.getElementById("displayName").value = displayName;
        }
        if(newBio.length == 0){
            newBio = bio;
            document.getElementById("bio").value = bio;
        }

        let formData = new FormData();
        formData.append("dispName", newDisplayName);
        formData.append("pfp", globalPfpFile);
        formData.append("bio", newBio);
        formData.append("prns", pronouns);
        axios.post("/instantiateUser", formData, {
            headers:{
                "Content-Type":"multipart/form-data"
            }
        })
        .then((response)=>{
            unsaved=false;
        })
        .catch((e)=>{
            console.log(e);
        });
    }

    function makeUnsaved(){
        unsaved = true;
    }

    return(
        <>
            <button onClick={saveCheck} className={`${button}`}>Return</button>
            <br></br>
            <h1>Settings</h1>
            <label>Display Name</label>
            <br></br>
            <input autoComplete="off" id="displayName" type="text" defaultValue={displayName} onChange={makeUnsaved}></input>
            <br></br>
            <br></br>
            <label>Pronouns</label>
            <br></br>
            <input id="pronouns" autoComplete="off" type="text" onChange={makeUnsaved} defaultValue={pronouns}></input>
            <br></br>
            <br></br>
            <label>Profile Picture</label>
            <br></br>
            <input type="file" accept="image/*" id="pfp" onChange={function(){
                unsaved = true;

                let imgInput = document.getElementById("pfp");
                let imgHolder = new Image();
                let objUrl = URL.createObjectURL(imgInput.files[0]);

                imgHolder.onload = function(){
                    if(imgHolder.width/imgHolder.height!=1){
                        writeImgError("Image must have a square ratio");
                        URL.revokeObjectURL(objUrl);
                    }else{
                        writeImgError("");
                        setPfp(objUrl);
                        changeImgDisplay("block");
                        globalPfpFile = imgInput.files[0];
                    }
                }

                imgHolder.src = objUrl;
            }}></input>
            <br></br>
            <img className={`rounded-full ${imgDisplay} w-[200px] h-[200px]`} src={pfp}></img>
            <p>{imgErr}</p>
            <br></br>
            <br></br>
            <label>Bio</label>
            <br></br>
            <textarea id="bio" autoComplete="off" defaultValue={bio} onChange={makeUnsaved}></textarea>
            <br></br>
            <hr></hr>
            <br></br>
            <label>Email</label>
            <br></br>
            <div className={`${checkDisplay}`}>
                <h4>You have unsaved changes? Leave anyways?</h4>
                <button onClick={function(){
                    save();
                    navigate(`/profile/${username}`);
                }}>Save Changes!!</button>
                <br></br>
                <button onClick={function(){
                    navigate(`/profile/${username}`);
                }}>Nah, leave</button>
            </div>
            <button onClick={save} className={`${button}`}>Save Changes</button>
        </>
    )
}