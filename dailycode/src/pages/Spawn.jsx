import { useState } from 'react'
import axios from 'axios';
import { useNavigate } from "react-router";

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Spawn(){
  const [signupDisplay, changeSignupDisplay] = useState("hidden");
  const [loginDisplay, changeLoginDisplay] = useState("hidden");
  const [buttonDisplay, changeButtonDisplay] = useState("hidden");
  const [buttonToHide, hideButton] = useState("block");
  const [buttonText, changeButtonText] = useState("Log in");

  const navigate = useNavigate();

  return (
    <>
      <h1>DailyCode</h1>
      <br></br>
      <h3>ooooh oooh ooh ahh ahh cool brand text here im a monkey look!!!</h3>
      <br></br>
      <button className={`${buttonToHide}`} onClick={function(){
        changeSignupDisplay("block");
        changeButtonDisplay("block");
        hideButton("hidden");
      }}>sign up/log in uhhh wtvr</button>
      <br></br>
      <br></br>
      <SignUp displayState={signupDisplay}></SignUp>
      <LogIn displayState={loginDisplay}></LogIn>
      <br></br>
      <button className={`${buttonDisplay}`} onClick={function(){
        if(buttonText == "Log in"){
          changeButtonText("Sign up");
          changeLoginDisplay("block");
          changeSignupDisplay("hidden");
        }else{
          changeButtonText("Log in");
          changeLoginDisplay("hidden");
          changeSignupDisplay("block");
        }
      }}>{buttonText}</button>
    </>
  )
}

function SignUp({displayState}){
  const [errorMsg, writeError] = useState("");
  const navigate = useNavigate();

  let index = 0;

  function loading(){
    let coolPuncts = [".", "..", "..."];
    if(index==3){
      index=0;
    }
    writeError("Successfully created user! Redirecting" + coolPuncts[index]);
    index+=1;
  }

  return (
    <div className={`${displayState}`}>
      <h3>Sign Up</h3>
      <br></br>
      <label>Username</label>
      <input type='text' name='userSignup' id='userSignup' autoComplete='off'></input>
      <br></br>
      <label>Password</label>
      <input type='text' name='passSignup' id='passSignup' autoComplete='off'></input>
      <br></br>
      <h5 id="errorMsg">{errorMsg}</h5>
      <br></br>
      <br></br>
      <button onClick={function(){
        let username = document.getElementById("userSignup").value;
        let password = document.getElementById("passSignup").value;

        if(username.length < 3 || username.length > 30){
          writeError("Username should be between 3-30 characters long!");
        }else if(password.length < 5){
          writeError("Password should be at least 5 characters long!");
        }else{
          axios.post("/signup", {user:username, pass:password})
          .then((response)=>{
            writeError(response.data.msg);
            if(response.data.msg == "Successfully created user! Redirecting..."){
              let loadInterval = setInterval(loading, 250);
              sleep(3000).then(()=>{
                clearInterval(loadInterval);
                navigate("/create-user");
              });
            }
          })
          .catch((e)=>{
            writeError(e);
          });
        }

      }}>Sign Up</button>
    </div>
  )
}

function LogIn({displayState}){
  const [errorMsg, writeError] = useState("");
  const navigate = useNavigate();

  let index = 0;
  
  function loading(){
    let coolPuncts = [".", "..", "..."];
    if(index==3){
      index=0;
    }
    writeError("Successfully logged in! Redirecting" + coolPuncts[index]);
    index+=1;
  }

  return(
    <div className={`${displayState}`}>
      <h3>Log In</h3>
      <br></br>
      <label>Username</label>
      <input name='userLogin' id='userLogin' autoComplete='off'></input>
      <br></br>
      <label>Password</label>
      <input name='passLogin' id='passLogin' autoComplete='off'></input>
      <br></br>
      <h5 id="errorMsg">{errorMsg}</h5>
      <br></br>
      <br></br>
      <button onClick={function(){
        let username = document.getElementById("userLogin").value;
        let password = document.getElementById("passLogin").value;

        if(username.length < 3 || username.length > 30){
          writeError("Username should be between 3-30 characters long!");
        }else if(password.length < 5){
          writeError("Password should be at least 5 characters long!");
        }else{
          axios.post("/login", {user:username, pass:password})
          .then((response)=>{
            if(response.data.msg == "Successfully logged in! Redirecting..."){
              let loadInterval = setInterval(loading, 250);
              sleep(3000).then(()=>{
                clearInterval(loadInterval);
                navigate("/home");
              });
            }else{
              writeError(response.data.msg);
            }
          })
          .catch((e)=>{
            writeError(e);
          });
        }
      }}>Log In</button>
    </div>
  )
}
