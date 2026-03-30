import axios from "axios";
import { BACKEND_URL } from "../../../config";
import { ChatRoom } from "../../../components/ChatRoom";

async function getRoomId(slug: string): Promise<string | null> {
    try{
        const response = await axios.get(`${BACKEND_URL}/api/users/room/${slug}`);
        if(response.status === 200){
            return response.data.roomId;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export default async function RoomPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const roomId = await getRoomId(slug);

    if(!roomId){
        return (
            <div>
                <h1 className="text-2xl font-bold">Room not found</h1>
            </div>
        )
    }

    // localStorage.setItem("roomId", roomId); // Store roomId in localStorage for later use in WebSocket connection

    return (
        <div>
            <ChatRoom roomId={roomId} slug={slug} />
        </div>
    )
}
