import express, { response } from "express";
import { MongoClient, Binary, BSON, ObjectId} from "mongodb";
import bodyParser from "body-parser";
import cors from "cors";
import crypto from "crypto";
import multer from "multer";
import nodemailer from "nodemailer";

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

//setup nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "gmail here",
        pass: "app specific password here" 
    },
});

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
            bio:userInfo.userBio,
            pronouns: userInfo.pronouns,
            email: userInfo.email,
            verified: userInfo.verified
        });
    }else{
        res.send({msg:"home"})
    }
});

app.post("/instantiateUser", upload.single("pfp"), async (req, res)=>{
    let { dispName, bio, prns } = req.body;
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
                    userBio:bio,
                    pronouns: prns
                }}
            ); 
        }else{
            usersColl.updateOne({username:globalUsername},
                {$set:{
                    displayName: dispName,
                    userBio:bio,
                    pronouns: prns
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
            creatorDisplay:globalDisplayName,
            creationDate: new Date().toLocaleDateString(),
            name: name,
            previewData: buffer,
            previewMimeType: mimetype,
            desc: desc,
            stack: stack,
            repo: repo,
            demo: demo,
            votes: {
                votes: 0,
                voters: [],
                voteStati: [],            
            },
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
});

app.post("/populate", async (req, res)=>{
    let dateToday = new Date().toLocaleDateString();
    let coll = await projectsColl.find({creationDate:dateToday}).sort({"votes.votes": -1}).toArray();

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
        tempDict["votes"] = coll[i].votes.votes;
        if(coll[i].votes.voters.includes(globalUsername)){
            tempDict["userVoteStatus"] = coll[i].votes.voteStati[coll[i].votes.voters.indexOf(globalUsername)];
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
    let crrntVotes = temp.votes.votes;
    
    if(temp.votes.voters.includes(globalUsername)){
        if(temp.votes.voteStati[temp.votes.voters.indexOf(globalUsername)] == voteStatus){
            if(voteStatus == "upvote"){
                crrntVotes-=1;
            }else{
                crrntVotes+=1;
            }

            color="white";

            let tempVotersArr = temp.votes.voters.filter(i => i != globalUsername);
            let tempStatusArr = temp.votes.voteStati.filter((_, i) => i != temp.votes.voters.indexOf(globalUsername));

            let highest;
            if(temp.highest){
                highest=temp.highest;
            }else{
                highest=0;
            }
            
            let creator = await usersColl.findOne({username: temp.creator});

            if(crrntVotes > highest){
                highest=crrntVotes;
                if(creator.email && creator.verified){
                    emailMilestone(highest, temp.name, creator.email, creator.displayName);
                }
            }
            
            projectsColl.updateOne({_id: prjctId},
                {$set:{
                    votes:{
                        votes: crrntVotes,
                        voters: tempVotersArr,
                        voteStati: tempStatusArr,
                    },
                    highest: highest
                }}
            );
        }else{
            if(voteStatus == "upvote" && temp.votes.voteStati[temp.votes.voters.indexOf(globalUsername)] == "downvote"){
                crrntVotes+=2;
            }else if(voteStatus == "downvote" && temp.votes.voteStati[temp.votes.voters.indexOf(globalUsername)] == "upvote"){
                crrntVotes-=2;
            }

            color="[#979899]";

            let tempVotesArr = temp.votes.voteStati;
            tempVotesArr[temp.votes.voters.indexOf(globalUsername)] = voteStatus;

            let highest;
            if(temp.highest){
                highest=temp.highest;
            }else{
                highest=0;
            }

            let creator = await usersColl.findOne({username: temp.creator});

            if(crrntVotes > highest){
                highest=crrntVotes;
                if(creator.email && creator.verified){
                    emailMilestone(highest, temp.name, creator.email, creator.displayName);
                }
            }

            projectsColl.updateOne({_id: prjctId},
                {$set:{
                    votes:{
                        votes: crrntVotes,
                        voters: temp.votes.voters,
                        voteStati: tempVotesArr,
                    },
                    highest: highest
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

        let highest;
        if(temp.highest){
            highest=temp.highest;
        }else{
            highest=0;
        }

        let creator = await usersColl.findOne({username: temp.creator});

        if(crrntVotes > highest){
            highest=crrntVotes;
            if(creator.email && creator.verified){
                emailMilestone(highest, temp.name, creator.email, creator.displayName);
            }
        }

        projectsColl.updateOne({_id: prjctId},
            {$set:{
                votes:{
                    votes: crrntVotes,
                    voters: [...temp.votes.voters, globalUsername],
                    voteStati: [...temp.votes.voteStati, voteStatus],
                },
                highest: highest
            }}
        );
    }

    res.send({newVotes: crrntVotes, color:color});
});

function emailMilestone(highest, prjctName, emailAddress, creator){
    let subject;
    let txt;
    let email = false;

    if(highest==1){
        subject="First upvote!";
        txt=`Your project ${prjctName} just received its first upvote!`;
        email=true;
    }else{
        if(
            highest==10 || highest==25 || highest==50 || highest==100 || highest==250 || highest == 500 || highest==1000 || highest == 2500
        ){
            subject=`${highest} votes!`;
            txt=`Your project ${prjctName} just hit ${highest} upvotes!`;
            email=true;
        }
    }

    if(email){
        transporter.sendMail({
            from: '"DailyCode", your email here',
            to: emailAddress,
            subject: subject,
            text: txt,
            html: 
            `<h1>Hi, ${creator}!</h1>
            <h2>${txt}</h2>
            `
        });
    }
}

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
    let votes = finding.votes.votes;
    let voteStatus = finding.votes.voteStati[finding.votes.voters.indexOf(globalUsername)];
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
        voteStatus: voteStatus,
        comments: comments
    });
});

app.post("/comment", async (req, res)=>{
    let id = ObjectId.createFromHexString(req.body.id);
    let commentTxt = req.body.comment;
    let date = new Date();

    let finding = await projectsColl.findOne({_id: id});
    let commentsArr = [...finding.comments, [date, globalUsername, globalPfp, commentTxt, globalDisplayName]];

    await projectsColl.updateOne({_id:id}, {
        $set:{
            comments: commentsArr
        }
    });

    let creator = await usersColl.findOne({username: finding.creator});
    if(creator.email && creator.verified){
        transporter.sendMail({
            from: '"DailyCode", your email here',
            to: creator.email,
            subject: "New Comment!",
            text: `Comment from ${globalDisplayName}: ${commentTxt}`,
            html: 
            `<h1>You have a new comment on ${finding.name}!</h1>
            <h3>${globalDisplayName} says:</h3>
            <p>${commentTxt}</p>
            `
        });
    }

    res.send({
        date: date,
        username: globalUsername,
        pfp: globalPfp,
        comments: commentsArr
    });
});

app.post("/fetchProfile", async (req, res)=>{
    let username = req.body.username;
    let finding = await usersColl.findOne({username:username});
    let ids = [];
    for(let i of finding.projects){
        let temp = await projectsColl.findOne({name:i, creator:username});
        ids.unshift(temp._id);
    }
    finding["projectIds"] = ids;
    if(username==globalUsername){
        finding["selfUser"] = true;
    }else{
        finding["selfUser"] = false;
    }

    res.send(finding);
});

app.post("/updateStatus", async (req, res)=>{
    await usersColl.updateOne({username: globalUsername},{
        $set:{
            status: req.body.status
        }
    });

    res.send({msg:"success"});
});

app.post("/sendEmail", async (req, res)=>{
    let email = req.body.email;
    let emailSubject = req.body.emailSubject;
    //let emailBody = req.body.emailBody;

    if(emailSubject == "Verification"){
        await usersColl.updateOne({username: globalUsername},{
            $set:{
                email: email,
                verified: false
            }
        });

        transporter.sendMail({
            from: '"DailyCode", your email here',
            to: email,
            subject: emailSubject,
            text: "Congratulations! Your account has been verified!",
            html: 
            `<h1>Hey!</h1>
            <h3>Click here to verify your email ~☆</h3>
            <a href="http://localhost:5173/verification/${globalUsername}">Verify!</a>
            `
        });
    }

    res.send("success");
});

app.post("/verify", async (req, res)=>{
    let userToVerify = req.body.user;
    await usersColl.updateOne({username: userToVerify},{
        $set:{
            verified: true
        }
    });
    res.send("success");
})

app.listen(3000, ()=>{
    console.log("successfully listening");
});