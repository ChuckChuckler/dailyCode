import express, { response } from "express";
import { MongoClient, Binary} from "mongodb";
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
const uri = "placeholder";
const client  = new MongoClient(uri);
client.connect();
let dailycodeDB = client.db("dailyCodeDB");
let usersColl = dailycodeDB.collection("users");
let projectsColl = dailycodeDB.collection("projects");

//setup multer
const upload = multer({storage: multer.memoryStorage()});

let globalUsername;
let globalPfp;
let globalDisplayName;

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
    let hash = crypto.createHash("sha256");

    try{
        let finding = await usersColl.findOne({username: user});
        if(finding){
            finding = await usersColl.findOne({username:user, password:hash.update(pass).digest("hex")});
            if(finding){
                globalUsername = user;
                globalPfp = [finding.pfpData.buffer, finding.pfpMimeType];
                globalDisplayName = finding.displayName;
                res.send({msg:"Successfully logged in! Redirecting..."});
            }else{
                res.send({msg:"Incorrect password!"});
            }
        }else{
            res.send({msg:"We couldn't find this account. Double check your username?"})
        }
    }catch(e){
        res.send({msg:e});
    }
});

app.get("/getPfp", (req, res)=>{
    res.set("Content-Type", globalPfp[1]);
    res.send(globalPfp[0]);
});

app.get("/getUserInfo", async (req, res)=>{
    let userInfo = await usersColl.findOne({username:globalUsername});
    res.send({
        displayName:globalDisplayName,
        username:globalUsername,
        bio:userInfo.userBio
    });
});

app.post("/instantiateUser", upload.single("pfp"), async (req, res)=>{
    let { dispName, bio } = req.body;
    let pfpFile = req.file;
    try{
        if(pfpFile!=null){
            let { buffer, mimetype } = pfpFile;
            globalPfp = [buffer, mimetype];
            usersColl.updateOne({username:globalUsername},
                {$set:{
                    displayName: dispName,
                    pfpData: buffer,
                    pfpMimeType: mimetype,
                    userBio:bio
                }}
            ); 
        }else{
            usersColl.updateOne({username:globalUsername},
                {$set:{
                    displayName: dispName,
                    userBio:bio
                }}
            )
        }
        globalDisplayName = dispName;
        res.send({msg:"yipppee!!!"});
    }catch(e){
        res.send({msg:e});
    }
});

app.post("/createProject", upload.single("preview"), async (req,res)=>{
    let { name, desc, stack, repo, demo} = req.body;
    let previewFile = req.file;

    try{
        let { buffer, mimetype } = previewFile;
        projectsColl.insertOne({
            creator:globalUsername,
            creationDate: new Date().toLocaleDateString(),
            name: name,
            previewData: buffer,
            previewMimeType: mimetype,
            desc: desc,
            stack: stack,
            repo: repo,
            demo: demo,
            comments: []
        });

        usersColl.updateOne({username:globalUsername},
            {$push:{
                projects:{
                    $each: [name],
                    $position: 0
                }
            }}
        );

        res.send("success");
    }catch(e){
        res.send(e);
    }
})

app.post("/populate", async (req, res)=>{
    let dateToday = new Date().toLocaleDateString();
    let coll = await projectsColl.find({creationDate:dateToday}).toArray();
    let collDict = {};
    for(let i = 0; i < coll.length; i++){
        let tempDict = {};
        tempDict["name"] = coll[i].name;
        tempDict["creator"] = coll[i].creator;
        let base64 = coll[i].previewData.buffer.toString("base64");
        tempDict["preview"] = `data:${coll[i].previewMimeType};base64,${base64}`;
        collDict[coll[i]._id] = tempDict;
    }
    res.send(collDict);
})

app.listen(3000, ()=>{
    console.log("successfully listening");
});