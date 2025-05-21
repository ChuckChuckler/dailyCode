import axios from "axios";
import { useState } from "react";
import "./Pages.css";

export default function Home(){
    const [displayname, setDisplayName] = useState("");
    const [pfp, setPfp] = useState(null);
    const [projectDiv, displayProjectDiv] = useState("hidden");
    const [createBtn, displayCreateBtn] = useState("block");
    const [gitErr, writeGitErr] = useState("");
    const [demoErr, writeDemoErr] = useState("");
    const [saveBtn, displaySaveBtn] = useState("block");
    const [nameErr, writeNameErr] = useState("");
    const [descErr, writeDescErr] = useState("");
    const [stackErr, writeStackErr] = useState("");

    window.onload = function(){
        axios.get("/getUserInfo")
        .then((response)=>{
            setDisplayName(response.data.displayName);
        })
        .catch((e)=>{
            console.log(e);
        })

        setPfp("/getPfp");
    }

    return(
        <>
            <img src={pfp} className="w-[100px] h-[100px] rounded-full" onClick={function(){
                window.location.href = "/user-profile";
            }}></img>
            <h3>Good to see you, {displayname}!</h3>
            <br></br>
            <hr></hr>
            <br></br>
            <h2>Today's Prompt:</h2>
            <h1>PROMPT PLACEHOLDER</h1>
            <br></br>
            <button onClick={function(){
                displayProjectDiv("block");
                displayCreateBtn("hidden");
            }} className={`${createBtn}`}>Create Project</button>
            <br></br>
            <div className={`${projectDiv}`}>
                <h2>Create Project!</h2>
                <br></br>
                <label>Project Name</label>
                <br></br>
                <input type="input" autoComplete="off" placeholder="Pick a cool name!" id="name"></input>
                <br></br>
                <p>{nameErr}</p>
                <br></br>
                <br></br>
                <label>Project Description</label>
                <br></br>
                <textarea id="desc" placeholder="What does your project do? Why did you make it? What processes did you go through?"></textarea>
                <br></br>
                <p>{descErr}</p>
                <br></br>
                <br></br>
                <label>Tech Stack</label>
                <br></br>
                <textarea id="stack" placeholder="Languages? Libraries? Frameworks? Separate each one with a comma!"></textarea>
                <br></br>
                <p>{stackErr}</p>
                <br></br>
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
                        
                    }

                }}>Create!</button>
            </div>
        </>
    )
}