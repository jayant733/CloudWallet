import { password } from "bun";

import z from "zod"

export const signinschema = z.object({
    email : z.string(),
    password : z.string(),
})