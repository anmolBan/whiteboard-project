import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { CreateRoomSchema, UserSigninSchema, UserSignupSchema } from "@repo/types";
import  prisma from "@repo/db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend_common";
import authMiddleware from '../../middleware/index.js';
// import authMiddleware from '../../middlewares';

const router = express.Router();
// Define your user-related routes here
router.get('/', (req, res) => {
  res.send('Hi there! This is the user route.');
});

router.post('/signup', async (req: Request, res: Response) => {
  const body = req.body;

  const parsedBody = UserSignupSchema.safeParse(body);

  if (!parsedBody.success) {
    return res.status(400).json({ 
      message: "Invalid input data for user signup.",
      error: JSON.parse(parsedBody.error.message) });
  }

  const { name, email, password } = parsedBody.data;

  try{
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({
      message: "User created successfully.",
      user: {
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error: unknown) {
    res.status(500).json({
      message: "An error occurred while creating the user.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post('/signin', async (req: Request, res: Response) => {
  const body = req.body;
  const parsedBody = UserSigninSchema.safeParse(body);
  if (!parsedBody.success) {
    return res.status(400).json({ 
      message: "Invalid input data for user signin.",
      error: parsedBody.error.message });
  }

  const { email, password } = parsedBody.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({userId: user.id, email: user.email, name: user.name}, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ message: "User signed in successfully.", token });
  } catch (error: unknown) {
    res.status(500).json({
      message: "An error occurred while signing in the user.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post('/create-room', authMiddleware, async (req: Request, res: Response) => {
  const body = req.body;

  const parsedBody = CreateRoomSchema.safeParse(body);

  if(!parsedBody.success){
    return res.status(400).json({
      message: 'Invalid input data for creating a room.'
    });
  }

  const adminId = req.userId;

  if(!adminId || typeof adminId !== "string"){
    return res.status(401).json({message: "User not authenticated."});
  }

  const { name } = parsedBody.data;

  try{
    const room = await prisma.room.create({
      data: {
        slug: name,
        adminId
      }
    });

    return res.status(201).json({
      message: "Room created successfully.",
      roomId: room.id,
      roomSlug: room.slug
    });
  } catch(error){
    return res.status(500).json({
      message: "An error occurred while creating the room.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get('/room/:slug', async (req: Request, res: Response) => {
    const slug = req.params.slug;

    if(!slug || typeof slug !== "string"){
        return res.status(400).json({message: "Invalid room slug."});
    }
    try{
        const room = await prisma.room.findUnique({
            where: {
                slug
            }
        });

        if(!room){
            return res.status(404).json({message: "Room not found."});
        }
        return res.status(200).json({
            message: "Room found.",
            roomId: room.id
        });
    } catch(error){
        return res.status(500).json({
            message: "An error occurred while fetching the room.",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

router.get('/chats/:roomId', async (req: Request, res: Response) => {
    const roomId = req.params.roomId;

    if(!roomId || typeof roomId !== 'string'){
        return res.status(400).json({message: "Invalid room ID."});
    }

    try{
        const chats = await prisma.chat.findMany({
            where: {
                roomId
            },
            orderBy: {
                createdAt: 'asc'
            },
            take: 50,
            include: {
              user: {
                select: {
                  name: true
                }
              }
            }
        });
        return res.status(200).json({
            message: "Chats fetched successfully.",
            chats: chats.map(chat => ({
                userId: chat.userId,
                message: chat.message,
                name: chat.user.name,
                timestamp: chat.createdAt
            }))
        });
    } catch(error){
        return res.status(500).json({
            message: "An error occurred while fetching the chats.",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

export default router;