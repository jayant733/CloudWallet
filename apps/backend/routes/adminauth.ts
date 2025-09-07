import {  Router } from "express";
import type{ Request } from "express";
import type { Response } from "express";
import { TSSCli } from "solana-mpc-tss-lib/mpc";
import { prismaclient } from "db/client"
import { createUserSchema, sendSchema, signinschema } from "common/input"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
import { isAsExpression, server } from "typescript"
import axios from "axios"
import { memo, use } from "react";
import {NETWORKS} from "common/solana"

const cli= new TSSCli(NETWORKS);

export const adminrouter = Router()


const mpc_servers = [
     "http://localhost:3000",
     "http://localhost:3001",
     "http://localhost:3002"

]
const MPC_SERVER_THRESHOLD = Math.max(1, mpc_servers.length-1)


adminrouter.post("/login", async (req: Request, res: Response) => {
    const {success, data} = signinschema.safeParse(req.body);
    if(!success){
        res.status(403).json({
            message  : "INvalid CRediantials"
        })
        return ;
    }
    const email = data.email;
    const password = data.password;

    const user = await prismaclient.user.findFirst({
        where :{
            email : email
        }
    })

    if(!user){
         res.status(403).json({
            message  : "User not found "
        })
        return ;
    }

    
    if (password !== user.password) {
            return res.status(403).json({
             message: "Invalid Credentials"
    });
    }
    const token = jwt.sign({
        userId : user.id,

    }, process.env.ADMIN_JWT_SECRET!)

    res.status(200).json({
        message: "Login successful",
        user: {

            token,
            id: user.id,
            email: user.email
        
        }
    });
});

adminrouter.post("/create-user" , async(req, res) =>{
    const {success , data}= createUserSchema.safeParse(req.body);

    if(!success){
        res.status(403).json({
            message : "Invalid Crediantials"
        })
        return;
    }

    const user = await prismaclient.user.create({
        data : {
            email : data.email,
            password : data.password,
            phone : data.phone,
            role : "USER"
        }
    })

    const promises = await Promise.all(mpc_servers.map(async (server) => {
        const responses = await axios.post(`${server}/create-user` ,{
            userId : user.id,
        })
        return responses.data;
    }))

    const aggregatedpublickey = cli.aggregateKeys(
        promises.map((r)=> r.publicKey)
    ,MPC_SERVER_THRESHOLD)

    await prismaclient.user.update({
        where: {
            id : user.id,
        },
        data :{
            publicKey : aggregatedpublickey.aggregatedPublicKey
        }
    })
    await cli.airdrop(aggregatedpublickey.aggregatedPublicKey, 1000000000000000)

    res.json({
        message : "User-created",
        user
    })



})

adminrouter.post("/send" , async (req ,res )=>{
    const { success, data} = sendSchema.safeParse(req.body);
    const blockhash  = await cli.recentBlockHash();
    if(!success){
        res.status(403).json({
            message :"Incorrect Credentials"
        })
    }

    const user  = await prismaclient.user.findFirst({
        where : {
            id : req.userId
        }
    })

    if(!user){
        res.status(404).json({
            message : "user not found"
        })
    }

    const step1response = await Promise.all(mpc_servers.map( async(server) =>{
        const response = await axios.post(`${server}/send/step-1` , {
            to : data?.to,
            amount : data?.amount,
            userId : req.userId,
            recentBlockHash : blockhash
        })

        return response.data;

    }

    
))
    const step2response = await Promise.all(mpc_servers.map(async (server, index) =>{


        const response  = await axios.post(`${server}/send/step-2`, {
            to : data?.to,
            amount : data?.amount,
            userId : req.userId,
            recentBlockhash : blockhash,
            step1response : step1response[index],
            allPublicNonces : JSON.stringify(step1response.map((r)=>{
                r.response.publicNonces
            }))
        })
        return response.data
    }))

    const partialSignature = step2response.map((r) =>
        r.response)

    const transactionDetails = {
        amount : 100000,
        to : data?.to,
        from : user?.publicKey,
        network : NETWORKS,
        memo : undefined,
        recentblockhash :blockhash
    }

    const signature = await cli.aggregateSignaturesAndBroadcast(
        JSON.stringify(partialSignature),
        JSON.stringify(transactionDetails),
        JSON.stringify(
            {
                aggregatePublicKey : user?.publicKey,
                participantKey : step2response.map((r)=>r.publicKey),
                threshold : MPC_SERVER_THRESHOLD,
            }
        )
    )

    return res.json(
        signature
    )

})