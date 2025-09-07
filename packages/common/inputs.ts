import { password } from "bun";

import z, { email, number } from "zod"

export const signinschema = z.object({
    email : z.string(),
    password : z.string(),
})

export const createUserSchema = z.object({
    email : z.string(),
    password : z.string(),
    phone : z.string(),
})

export const sendSchema = z.object({
    to : z.string(),
    amount : z.number(),
    
})

