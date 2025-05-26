import axios from "axios";
import { useState, useEffect } from "react";
import "./Pages.css";
import "../comps/ProjectCard.jsx";
import ProjectCard from "../comps/ProjectCard.jsx";
import { useNavigate } from "react-router";

let globalPicFile;
let username;

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Home(){
    const [displayname, setDisplayName] = useState("");
    const [pfp, setPfp] = useState(null);
    const [createDiv, displayCreateDiv] = useState("hidden");
    const [createBtn, displayCreateBtn] = useState("block");
    const [outerCreateDiv, displayOuterDiv] = useState("block");
    const [gitErr, writeGitErr] = useState("");
    const [demoErr, writeDemoErr] = useState("");
    const [saveBtn, displaySaveBtn] = useState("block");
    const [nameErr, writeNameErr] = useState("");
    const [descErr, writeDescErr] = useState("");
    const [stackErr, writeStackErr] = useState("");
    const [imgPreview, addImgPreview] = useState(null);
    const [imgDisplay, changeImgDisplay] = useState("hidden");
    const [imgErr, writeImgErr] = useState("");
    const [subErr, writeSubErr] = useState("");
    const [projectsDiv, displayProjects] = useState("block");
    const [arrOfProjects, addToArr] = useState([]);
    const [userProject, addUserProject] = useState([]);
    const [yourProject, showYourProject] = useState("hidden");

    const navigate = useNavigate();
    
    useEffect(()=>{
        const setupPage = async () => {
            await axios.get("/getUserInfo")
            .then((response)=>{
                if(response.data.msg == "home"){
                    navigate("/");
                }else{
                    setDisplayName(response.data.displayName);
                    username = response.data.username;
                    setPfp(response.data.pfp);
                }
            })
            .catch((e)=>{
                console.log(e);
            })

            let tempArr = [];

            await axios.post("/populate")
            .then((response)=>{
                let collDict = response.data;
                for(let i = 0; i < Object.keys(collDict).length; i++){
                    let tempHolder = collDict[Object.keys(collDict)[i]];
                    if(tempHolder.creator == username){
                        displayOuterDiv("hidden");
                        showYourProject("block");
                        addUserProject([Object.keys(collDict)[i], tempHolder.creator, tempHolder.creatorPfp, tempHolder.name, tempHolder.preview, tempHolder.votes, tempHolder.userVoteStatus]);
                    }else{
                        tempArr.push([Object.keys(collDict)[i], tempHolder.creator, tempHolder.creatorPfp, tempHolder.name, tempHolder.preview, tempHolder.votes, tempHolder.userVoteStatus]);
                    }
                }
            })
            .catch((e)=>{
                console.log(e);
            });
            
            addToArr(tempArr);
        };

        if(document.readyState == "complete"){
            setupPage();
        }else{
            window.addEventListener("load", setupPage);
        }

        return()=>window.removeEventListener("load", setupPage);
    }, []);
    
    let index = 0;
    
    function loading(){
        let coolPuncts = [".", "..", "..."];
        if(index==3){
            index=0;
        }
        writeSubErr("Project created successfully! Loading" + coolPuncts[index]);
        index+=1;
    }

    return(
        <>
            <img src={pfp} className="w-[100px] h-[100px] rounded-full" onClick={function(){
                navigate("/user-profile");
            }}></img>
            <h3>Good to see you, {displayname}!</h3>
            <br></br>
            <hr></hr>
            <br></br>
            <h2>Today's Prompt:</h2>
            <h1>PROMPT PLACEHOLDER</h1>
            <br></br>
            <h1>Your project:</h1>
            <div className={`${yourProject}`}>
                <ProjectCard key={userProject[0]} id={userProject[0]} creator={userProject[1]} creatorPfp={userProject[2]} name={userProject[3]} preview={userProject[4]} votes={userProject[5]} voteStatus={userProject[6]} ownProject={true}></ProjectCard>
            </div>
            <div className={`${outerCreateDiv}`}>
                <h2>You haven't made a project yet!</h2>
                <button onClick={function(){
                    displayCreateDiv("block");
                    displayCreateBtn("hidden");
                    displayProjects("hidden");
                }} className={`${createBtn}`}>Create Project</button>
                <div className={`${createDiv}`}>
                    <h2>Create Project!</h2>
                    <br></br>
                    <button onClick={function(){
                        displayCreateDiv("hidden");
                        displayCreateBtn("block");
                        displayProjects("block");
                    }}>Cancel</button>
                    <br></br>
                    <br></br>
                    <label>Project Name</label>
                    <br></br>
                    <input type="input" autoComplete="off" placeholder="Pick a cool name!" id="name"></input>
                    <br></br>
                    <p>{nameErr}</p>
                    <br></br>
                    <label>Project Photo</label>
                    <br></br>
                    <input type="file" accept="image/*" id="pic" onChange={function(){
                    let imgInput = document.getElementById("pic");
                    let imgHolder = new Image();
                    let objUrl = URL.createObjectURL(imgInput.files[0]);

                    imgHolder.onload = function(){
                        writeImgErr("");
                        addImgPreview(objUrl);
                        changeImgDisplay("block");
                        globalPicFile = imgInput.files[0];
                    }
                    
                    imgHolder.src = objUrl;
                }}></input>
                    <br></br>
                    <img className={`${imgDisplay} w-[300px] h-[300px] object-cover object-center`} src={imgPreview}></img>
                    <br></br>
                    <p>{imgErr}</p>
                    <br></br>
                    <label>Project Description</label>
                    <br></br>
                    <textarea id="desc" placeholder="What does your project do? Why did you make it? What processes did you go through?"></textarea>
                    <br></br>
                    <p>{descErr}</p>
                    <br></br>
                    <label>Tech Stack</label>
                    <br></br>
                    <textarea id="stack" placeholder="Languages? Libraries? Frameworks? Separate each one with a comma!"></textarea>
                    <br></br>
                    <p>{stackErr}</p>
                    <br></br>
                    <label>Github Repo</label>
                    <br></br>
                    <input type="text" autoComplete="off" id="repo" onBlur={function(){
                        let repoLink = document.getElementById("repo").value.trim();
                        if(repoLink!=""){
                            repoLink = repoLink.startsWith("http") ? repoLink : "https://" + repoLink;
                            try{
                                let url = new URL(repoLink);
                                if(url.hostname == "github.com" || url.hostname.endsWith(".github.com")){
                                    writeGitErr("Valid Github link!");
                                    displaySaveBtn("block");
                                }else{
                                    writeGitErr("Not a valid Github link.");
                                    displaySaveBtn("hidden");
                                }
                            }catch(e){
                                console.log(e);
                            }
                        }
                    }} placeholder="Add a link to your repository..."></input>
                    <br></br>
                    <p>{gitErr}</p>
                    <br></br>
                    <label>Demo!</label>
                    <br></br>
                    <input type="text" id="demo" autoComplete="off" onBlur={function(){
                        let demoLink = document.getElementById("demo").value.trim();
                        if(demoLink!=""){
                            const safetyPrtcls = ["http:", "https:"];
                            if(demoLink.startsWith("http")){
                                let url = new URL(demoLink);
                                console.log(url.protocol);
                                if(!safetyPrtcls.includes(url.protocol)){
                                    writeDemoErr("Not a valid link.");
                                    displaySaveBtn("hidden");
                                }else{
                                    writeDemoErr("Valid link!");
                                    displaySaveBtn("block");
                                }
                            }else{
                                writeDemoErr("Not a valid link.");
                                displaySaveBtn("hidden");
                            }
                        }
                    }} placeholder="Anything that demonstrates your project!"></input>
                    <br></br>
                    <p>{demoErr}</p>
                    <br></br>
                    <button className={`${saveBtn}`} onClick={function(){
                        let fullyFilled = false;

                        if(document.getElementById("name").value == ""){
                            writeNameErr("Write a name for your project!");
                            fullyFilled = false;
                        }else{
                            writeNameErr("");
                            fullyFilled = true;
                        }

                        if(document.getElementById("pic").value == null){
                            writeImgErr("Add a preview image!");
                            fullyFilled = false;
                        }else{
                            writeImgErr("");
                        }

                        if(document.getElementById("desc").value == ""){
                            writeDescErr("Write a description for your project!");
                            fullyFilled = false;
                        }else{
                            writeDescErr("");
                        }

                        if(document.getElementById("stack").value == ""){
                            writeStackErr("Add at least one thing to the tech stack!");
                            fullyFilled = false;
                        }else{
                            writeStackErr("");
                        }

                        if(document.getElementById("repo").value == ""){
                            writeGitErr("You need a repo link!");
                            fullyFilled = false;
                        }else{
                            writeGitErr("");
                        }

                        if(document.getElementById("demo").value == ""){
                            writeDemoErr("You need a demo link! (It can just be a YouTube video)");
                            fullyFilled = false;
                        }else{
                            writeDemoErr("");
                        }
                        
                        if(fullyFilled){
                            let projectData = new FormData();
                            projectData.append("name", document.getElementById("name").value);
                            projectData.append("preview", globalPicFile);
                            projectData.append("desc", document.getElementById("desc").value);
                            projectData.append("stack", document.getElementById("stack").value);
                            projectData.append("repo", document.getElementById("repo").value);
                            projectData.append("demo", document.getElementById("demo").value);

                            axios.post("/createProject", projectData, {
                                headers:{
                                    "Content-Type":"multipart/form-data"
                                }
                            })
                            .then((response)=>{
                                if(response.data == "success"){
                                    let loadInterval = setInterval(loading, 250);
                                    sleep(3000).then(()=>{
                                        clearInterval(loadInterval);
                                        location.reload();
                                    })
                                }else{
                                    writeSubErr(response.data);
                                }
                            })
                            .catch((e)=>{
                                writeSubErr(e);
                            });
                        }
                    }}>Create!</button>
                    <br></br>
                    <p>{subErr}</p>
                </div>
            </div>
            <br></br>
            <hr></hr>
            <br></br>
            <div className={`${projectsDiv}`}>
                <h1>✧ Today's Projects ✧</h1>
                <br></br>
                <div className={`grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[10px] w-[95%] h-[80vh] overflow-y-auto auto-rows-[375px]`}>
                    {arrOfProjects.map((data, i)=>(
                        <ProjectCard key={data[0]} id={data[0]} creator={data[1]} creatorPfp={data[2]} name={data[3]} preview={data[4]} votes={data[5]} voteStatus={data[6]} ownProject={false}></ProjectCard>
                    ))}
                </div>
            </div>
            <br></br>
        </>
    )
}