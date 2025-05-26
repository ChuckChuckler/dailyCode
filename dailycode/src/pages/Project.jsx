import axios from "axios";
import { useState, useEffect } from "react";
import "./Pages.css";
import { useParams, useNavigate } from "react-router";

export default function Project(){
    const [name, setName] = useState("");
    const [creator, setCreator] = useState("");
    const [date, setDate] = useState("");
    const [preview, setPreview] = useState(null);
    const [desc, setDesc] = useState("");
    const [stack, setStack] = useState("");
    const [repo, setRepo] = useState("");
    const [demo, setDemo] = useState("");
    const [votes, setVotes] = useState("");
    const [comments, setComments] = useState([]);
    const [commentBox, displayCommentBox] = useState("block");
    const [redirectLogin, displayRdrct] = useState("hidden");

    const navigate = useNavigate();

    const params = useParams();
    const id = params.id;

    useEffect(()=>{
        const loadProject = () => {
            axios.post("/fetchProject", {id: id})
            .then((response)=>{
                let prjct = response.data;
                setName(prjct.name);
                setCreator(prjct.creator);
                setDate(prjct.date);
                setPreview(prjct.previewFile);
                setDesc(prjct.desc);
                setStack(prjct.stack);
                setRepo(prjct.repo);
                setDemo(prjct.demo);
                setVotes(prjct.votes);
                setComments(prjct.comments);
            })
            .catch((e)=>{
                console.log(e);
            });

            axios.get("/getUserInfo")
            .then((response)=>{
                if(response.data.msg == "home"){
                    displayCommentBox("hidden");
                    displayRdrct("block");
                }
            })
            .catch((e)=>{
                console.log(e);
            });
        };

        if(document.readyState=="complete"){
            loadProject();
        }else{
            window.addEventListener("load", loadProject);
        }

        return()=>window.removeEventListener("load", loadProject);
    }, []);

    return(
        <>
            <button onClick={function(){
                navigate("/home");
            }}>Return Home</button>
            <br></br>
            <hr></hr>
            <br></br>
            <div className="flex justify-around">
                <div className="w-[48%]">
                    <h1>{name}</h1>
                    <h2>By: {creator}</h2>
                    <h3>Created: {date}</h3>
                    <img className="w-[300px] h-[300px]" src={preview}></img>
                    <br></br>
                    <p>{desc}</p>
                    <br></br>
                    <p>Tech Stack: {stack}</p>
                    <br></br>
                    <br></br>
                    <div className="flex justify-around w-[50%]">
                        <button onClick={function(){
                            window.open(repo, "_blank");
                        }}>Repository</button>
                        <button onClick={function(){
                            window.open(demo, "_blank");
                        }}>Demo</button>
                    </div>
                    <br></br>
                    <br></br>
                    <div className="flex justify-around w-[50%]">
                        <button>Upvote</button>
                        <h3>{votes}</h3>
                        <button>Downvote</button>
                    </div>
                </div>
                <div className="w-[48%] relative">
                    <h2>Comments</h2>
                    <div className={`${commentBox} flex justify-between w-[70%] absolute bottom-10`}>
                        <input type="text" autoComplete="off" id="commentInput" className="border-[0.5px] w-[85%]"></input>
                        <button onClick={function(){
                            let inputElm = document.getElementById("commentInput");
                            if(inputElm.value != ""){
                                let comment = inputElm.value;
                                axios.post("/comment", {id:id, comment:comment})
                                .then((response)=>{
                                    inputElm.value = "";
                                    console.log(response.data);
                                })
                                .catch((e)=>{
                                    console.log(e);
                                })
                            }
                        }}>Send</button>
                    </div>
                    <div className={`${redirectLogin}`}>
                        <h3 onClick={function(){
                            navigate("/");
                        }}>Sign up or log in to comment!</h3>
                    </div>
                </div>
            </div>
        </>
    )
}