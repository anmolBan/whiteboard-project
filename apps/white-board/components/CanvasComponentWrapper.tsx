import CanvasComponent from "./CanvasComponent";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import axios from "axios";

async function fetchCanvasData(roomId: string, token: string): Promise<any>{
    try{
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/canvasData/${roomId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if(response.status === 200){
            return response.data;
        }
    } catch (error) {
        console.error("Error fetching canvas data:", error);
    }
}

async function fetchChatData(roomId: string, token: string): Promise<{userId: string, name: string, message: string, timestamp: string}[]>{
    try{
        const response = await axios.get(`${process.env.BACKEND_URL}/api/users/chats/${roomId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        return response.data.chats ?? [];

    } catch(error){
        console.error("Error fetching chat data:", error);
        return [];
    }
}

export default async function CanvasComponentWrapper({roomId, roomName}: {roomId: string, roomName: string}) {
    const session = await getServerSession(authOptions);
    if(!session || !session.user || !session.user.accessToken){
        redirect("/signin");
    }
    const token = session.user.accessToken;

    // TODO handle case where roomID is invalid or null (e.g., show error message or redirect)
    if(!roomId){
        redirect("/");
    }
    const canvasData = await fetchCanvasData(roomId, token);
    const chatData = await fetchChatData(roomId, token);
    return (
        <CanvasComponent roomId={roomId} roomName={roomName} canvasData={canvasData} initialChats={chatData} />
    )
}