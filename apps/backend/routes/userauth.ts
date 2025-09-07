import type{ Request } from "express";
import type { Response } from "express";
import { Router } from "express";
import { prismaclient } from "db/client"
import { signinschema } from "common/input"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
export const userRouter= Router();


userRouter.post("/login", async (req: Request, res: Response) => {
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

    }, process.env.JWT_SECRET!)

    res.status(200).json({
        message: "Login successful",
        user: {

            token,
            id: user.id,
            email: user.email
        
        }
    });
});


userRouter.get("/calender/:courseId" , async (req : Request , res : Response) =>{
    //fetch the calender on the basisi of the course 

    const courseId = req.params.courseId;
    const course = await prismaclient.course.findFirst({
       where :{
         id : courseId
       }
    })


    if(!course){
        res.status(411).json({
            message : "Course with id not found "
        })
    }

    const purchase = await prismaclient.purchases.findFirst({
        where : {
            courseId : courseId,
            userId : req.userId,
        }
    })

    if(!purchase){
        res.status(403).json({
            message  :"you dont have access to the course"
        })
    }
        
    
    res.json({
        id : course?.id,
        calenderId : course?.CalenderNotionId
    })
})


userRouter.get("/courses" , async(req , res) =>{
        const courses = await prismaclient.course.findMany({
            where  :{
                purchases : {
                    some :{
                        userId :req.userId,
                    }
                }
            }
        })


        res.json({
            courses : courses.map(c =>({
                id : c.id,
                title : c.title,
                slug : c.title
            }))
        })
})