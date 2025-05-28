import axios from "axios";
import { useState, useEffect } from "react";
import "./Pages.css";
import { useNavigate } from "react-router";

let globalPfpFile;

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function UserCreation(){
    const [username, setUsername] = useState("");
    const [imgError, writeImgError] = useState("");
    const [imgPreview, addImgPreview] = useState(null);
    const [imgDisplay, changeImgDisplay] = useState("hidden");
    const [buttonDisplay, changeButtonDisplay] = useState("hidden");
    const [confirmationTxt, write] = useState("");

    const navigate = useNavigate();

    useEffect(()=>{
        const loadPage = () => {
            axios.get("/getUserInfo")
            .then((response)=>{
                if(response.data.msg == "home"){
                    navigate("/");
                }else{
                    setUsername(response.data.username);
                }
            })
            .catch((e)=>{
                console.log(e);
            });
        };

        if(document.readyState == "complete"){
            loadPage();
        }else{
            window.addEventListener("load", loadPage);
        }

        return()=>window.removeEventListener("load", loadPage);
    },[])

    let index = 0;
    
    function loading(){
        let coolPuncts = [".", "..", "..."];
        if(index==3){
            index=0;
        }
        write("Thanks! Redirecting" + coolPuncts[index]);
        index+=1;
    }

    return (
        <>
            <h1>Hey, {username}</h1>
            <h3>Let's get started creating your account!</h3>
            <br></br>
            <label>Display name</label>
            <br></br>
            <input type="text" id="displayName" autoComplete="off" placeholder={username}></input>
            <br></br>
            <br></br>
            <label>Profile picture</label>
            <br></br>
            <input type="file" accept="image/*" id="pfp" onChange={function(){
                let imgInput = document.getElementById("pfp");
                let imgHolder = new Image();
                let objUrl = URL.createObjectURL(imgInput.files[0]);

                imgHolder.onload = function(){
                    if(imgHolder.width/imgHolder.height!=1){
                        writeImgError("Image must have a square ratio");
                        changeImgDisplay("hidden");
                        changeButtonDisplay("hidden");
                        URL.revokeObjectURL(objUrl);
                    }else{
                        writeImgError("");
                        addImgPreview(objUrl);
                        changeImgDisplay("block");
                        changeButtonDisplay("block");
                        globalPfpFile = imgInput.files[0];
                    }
                }

                imgHolder.src = objUrl;
            }}></input>
            <br></br>
            <img className={`${imgDisplay} rounded-full w-[300px] h-[300px]`} src={imgPreview}></img>
            <h3>{imgError}</h3>
            <br></br>
            <label>Bio</label>
            <br></br>
            <textarea id="bio" placeholder="Write something about yourself here!" maxLength="300" defaultValue="I love coding!"></textarea>
            <br></br>
            <br></br>
            <button className={`${buttonDisplay}`} onClick={function(){
                let userDisplayName = document.getElementById("displayName").value;
                if(userDisplayName.length == 0){
                    userDisplayName = username;
                }
                let userBio = document.getElementById("bio").value;
                if(userBio.length == 0){
                    userBio = "I love coding!";
                }

                let formData = new FormData();
                formData.append("dispName", userDisplayName);
                formData.append("pfp", globalPfpFile);
                formData.append("bio", userBio);
                formData.append("pronouns", "");
                axios.post("/instantiateUser", formData, {
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                })
                .then((response)=>{
                    let loadInterval = setInterval(loading, 250);
                    sleep(3000).then(()=>{
                        clearInterval(loadInterval);
                        navigate("/home");
                    })
                })
                .catch((e)=>{
                    console.log(e);
                });
            }}>I'm done!</button>
            <br></br>
            <h4>{confirmationTxt}</h4>
            <br></br>
        </>
    )
}