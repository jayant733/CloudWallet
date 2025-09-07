import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"





export function userauthMiddleware(req: Request, res: Response, next: NextFunction) {
  const header= req.headers.authorization;
  const token = header?.split(" ")[1];

  if(!token){
    res.status(403).json({
        message : "unathorized"
    })
    return ;
  }
  try {
     const {userId }= jwt.verify(token , process.env.JWT_SECRET!) as JwtPayload
     if(userId){
        req.userId = userId 
     }
     next()
   }
   catch(e){
    return res.status(403).json({
        message : "unauthorized "
    })
   }
}


export function adminauthMiddleware(req: Request, res: Response, next: NextFunction) {
  const header= req.headers.authorization;
  const token = header?.split(" ")[1];

  if(!token){
    res.status(403).json({
        message : "unathorized"
    })
    return ;
  }
  try {
     const {userId }= jwt.verify(token , process.env.ADMIN_JWT_SECRET!) as JwtPayload
     if(userId){
        req.userId = userId 
     }
     next()
   }
   catch(e){
    return res.status(403).json({
        message : "unauthorized "
    })
   }
}
