import express, { response } from "express";
import { MongoClient } from "mongodb";
import bodyParser from "body-parser";
import cors from "cors";
import crypto from "crypto";
import multer from "multer";

//setup express app
const app = express();
/*app.use(cors({
    origin: "placeholder-url",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization"
}));*/ //uncomment this when the actual link is published

app.use(express.json());

//setup mongo
const uri = "uri";
const client  = new MongoClient(uri);
client.connect();
let dailycodeDB = client.db("dailyCodeDB");
let usersColl = dailycodeDB.collection("users");
let projectsColl = dailycodeDB.collection("projects");

//setup multer
const upload = multer({storage: multer.memoryStorage()});

let globalUsername;

app.post("/signup", async (req, res)=>{
    let user = req.body.user;
    let pass = req.body.pass;
    
    try{
        if(await usersColl.findOne({username: user})){
            res.send({msg:"User already exists"});
        }else{
            let hash = crypto.createHash("sha256");
            usersColl.insertOne({
                username:user,
                password:hash.update(pass).digest("hex"),
                projects:[]
            })
            globalUsername = user;
            res.send({msg:"Successfully created user! Redirecting..."});
        }
    }catch(e){
        res.send({msg:`Error: ${e}`});
    }
});

app.post("/login", async (req, res)=>{
    let user = req.body.user;
    let pass = req.body.pass;

    try{
        let finding = await usersColl.findOne({username: user});
    }catch(e){
        console.log(e);
    }
});

app.get("/getUser", (req, res)=>{
    res.send({username:globalUsername});
});

app.post("/instantiateUser", upload.single("pfp"), async (req, res)=>{
    let { dispName, bio } = req.body;
    let pfpFile = req.file;
    let { buffer, mimetype, originalname} = pfpFile;

    try{
        usersColl.updateOne({username:globalUsername},
            {$set:{
                displayName: dispName,
                pfpData: buffer,
                pfpMimeType: mimetype,
                pfpName: originalname,
                userBio:bio
            }}
        )
        res.send({msg:"yipppee!!!"});
    }catch(e){
        res.send({msg:e});
    }
});

app.listen(3000, ()=>{
    console.log("successfully listening");
});