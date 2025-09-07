import express from "express"
import {PublicKey, TSSCli } from "solana-mpc-tss-lib/mpc"
import {prismaclient } from  "mpc-db/mpc-db"
import {NETWORKS} from "common/solana"

const cli = new TSSCli(NETWORKS)


const app = express();

app.post("/create-user" , async(req, res)=>{
    const {userId} = req.body;
    const participate= await cli.generate();
    prismaclient.keyShare.create({
        data :{
            userId,
            publicKey : participate.publicKey,
            secretKey : participate.secretKey
        }
    })
    res.json({
        publicKey : participate.publicKey,
    })

})

app.post("/send/step-1", async (req , res)=>{
    const { to , amount , userId ,recentBlockHash} = req.body;
    const user = await prismaclient.keyShare.findFirst({
        where : {
            userId
        }
    })
    if(!user){
        res.status(403).json({
            message : "User not FOund "
        })
    }

  

    const step1p1 = await cli.aggregateSignStepOne(
        user?.secretKey!,
        to,
        amount,
        undefined,
        recentBlockHash
    )

    res.json({
        step1p1
    })

})

app.post("/send/step-2" , async(req ,res) =>{
    const {to , amount , userId, recentBlockHash, step1response, allpublicNonces} = req.body;
    const user = await prismaclient.keyShare.findFirst({
        where : {
            userId
        }
    })

    if(!user){
        res.status(403).json({
            message : "User not found",
     })
        return;
    }

    const reponse2 = await cli.aggregateSignStepTwo(
       step1response,
        user.secretKey,
        to,
        amount,
        allpublicNonces,
        undefined,
        recentBlockHash
    )

    res.json({
        reponse2,
        PublicKey : user.publicKey
    })

})

app.listen(3001)
