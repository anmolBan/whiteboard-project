"use server";

import { UserSignupSchema } from "@repo/types";
import prisma from "@repo/db";
import bcryp from "bcrypt";

export default async function handleSignup({name, email, password}: {name: string, email: string, password: string}){
    const body = { name, email, password };

    const parsedBody = UserSignupSchema.safeParse(body);

    if(!parsedBody.success){
        return {
            message: "Invalid input data for user signup.",
            status: 400
        }
    }

    try{
        const res =  await prisma.user.findUnique({
            where: {
                email
            }
        });

        if(res){
            return {
                message: "User alredy exists with this email.",
                status: 409
            }
        }

        const hashedPassword = await bcryp.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        return {
            message: "User created successfully.",
            user: {
                email: newUser.email,
                name: newUser.name
             },
             status: 201
         }
    } catch (error: unknown) {
        return {
            message: "An error occurred while creating the user.",
            error: error instanceof Error ? error.message : "Unknown error",
            status: 500
        }
    }
}