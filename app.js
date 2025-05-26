import express, { response } from "express";
import { MongoClient, Binary, BSON, ObjectId} from "mongodb";
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

let globalUsername = "";
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
                globalPfp = `data:${finding.pfpMimeType};base64,${finding.pfpData.buffer.toString("base64")}`
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

app.get("/getUserInfo", async (req, res)=>{
    if(globalUsername != ""){
        let userInfo = await usersColl.findOne({username:globalUsername});
        res.send({
            msg:"success",
            displayName:globalDisplayName,
            username:globalUsername,
            pfp:globalPfp,
            bio:userInfo.userBio
        });
    }else{
        res.send({msg:"home"})
    }
});

app.post("/instantiateUser", upload.single("pfp"), async (req, res)=>{
    let { dispName, bio } = req.body;
    let pfpFile = req.file;
    try{
        if(pfpFile!=null){
            let { buffer, mimetype } = pfpFile;
            globalPfp = `data:${mimetype};base64,${buffer.toString("base64")}`;
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
            votes: 0,
            voters: [],
            voteStati: [],
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
    let coll = await projectsColl.find({creationDate:dateToday}).sort({votes: -1}).toArray();

    let collDict = {};
    for(let i = 0; i < coll.length; i++){
        let tempDict = {};
        tempDict["name"] = coll[i].name;
        tempDict["creator"] = coll[i].creator;
        let targetUser = await usersColl.findOne({username: coll[i].creator});
        let pfpBase64 = targetUser.pfpData.buffer.toString("base64");
        let pfpMime = targetUser.pfpMimeType;
        tempDict["creatorPfp"] = `data:${pfpMime};base64,${pfpBase64}`;
        let base64 = coll[i].previewData.buffer.toString("base64");
        tempDict["preview"] = `data:${coll[i].previewMimeType};base64,${base64}`;
        tempDict["votes"] = coll[i].votes;
        if(coll[i].voters.includes(globalUsername)){
            tempDict["userVoteStatus"] = coll[i].voteStati[coll[i].voters.indexOf(globalUsername)];
        }else{
            tempDict["userVoteStatus"] = "none";
        }
        collDict[coll[i]._id] = tempDict;
    }

    res.send(collDict);
});

app.post("/updateVotes", async (req, res)=>{
    let givenId = req.body.id;
    let prjctId = ObjectId.createFromHexString(givenId);
    let voteStatus = req.body.status;

    let color;

    let temp = await projectsColl.findOne({_id:prjctId});
    let crrntVotes = temp.votes;

    if(temp.voters.includes(globalUsername)){
        if(temp.voteStati[temp.voters.indexOf(globalUsername)] == voteStatus){
            if(voteStatus == "upvote"){
                crrntVotes-=1;
            }else{
                crrntVotes+=1;
            }

            color="white";

            let tempVotersArr = temp.voters.filter(i => i != globalUsername);
            let tempStatusArr = temp.voteStati.filter((_, i) => i != temp.voters.indexOf(globalUsername));

            projectsColl.updateOne({_id: prjctId},
                {$set:{
                    votes: crrntVotes,
                    voters: tempVotersArr,
                    voteStati: tempStatusArr
                }}
            );
        }else{
            if(voteStatus == "upvote" && temp.voteStati[temp.voters.indexOf(globalUsername)] == "downvote"){
                crrntVotes+=2;
            }else if(voteStatus == "downvote" && temp.voteStati[temp.voters.indexOf(globalUsername)] == "upvote"){
                crrntVotes-=2;
            }

            color="[#979899]";

            let tempVotesArr = temp.voteStati;
            tempVotesArr[temp.voters.indexOf(globalUsername)] = voteStatus;

            projectsColl.updateOne({_id: prjctId},
                {$set:{
                    votes: crrntVotes,
                    voters: temp.voters,
                    voteStati: tempVotesArr
                }}
            );
        }
    }else{
        if(voteStatus == "upvote"){
            crrntVotes+=1;
        }else{
            crrntVotes-=1;
        }

        color="[#979899]";

        projectsColl.updateOne({_id: prjctId},
            {$set:{
                votes: crrntVotes,
                voters: [...temp.voters, globalUsername],
                voteStati: [...temp.voteStati, voteStatus]
            }}
        );
    }

    res.send({newVotes: crrntVotes, color:color});
});

app.post("/fetchProject", async (req, res)=>{
    let id=ObjectId.createFromHexString(req.body.id);
    let finding = await projectsColl.findOne({_id:id});
    let name = finding.name;
    let creator = finding.creator;
    let date = finding.creationDate;
    let previewBase64 = finding.previewData.buffer.toString("base64");
    let previewMime = finding.previewMimeType;
    let previewFile = `data:${previewMime};base64,${previewBase64}`;
    let desc = finding.desc;
    let stack = finding.stack;
    let repo = finding.repo;
    let demo = finding.demo;
    let votes = finding.votes;
    let comments = finding.comments;
    res.send({
        name: name,
        creator: creator,
        date: date,
        previewFile: previewFile,
        desc: desc,
        stack: stack,
        repo: repo, 
        demo: demo,
        votes: votes,
        comments: comments
    });
});

app.post("/comment", async (req, res)=>{
    let id = ObjectId.createFromHexString(req.body.id);
    let commentTxt = req.body.comment;
    let date = new Date();

    let finding = await projectsColl.findOne({_id: id});
    let commentsArr = [...finding.comments, [date, globalUsername, globalPfp, commentTxt]];
    await projectsColl.updateOne({_id:id}, {
        $set:{
            comments: commentsArr
        }
    });

    res.send({
        date: date,
        username: globalUsername,
        pfp: globalPfp
    });
})

app.listen(3000, ()=>{
    console.log("successfully listening");
});