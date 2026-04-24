import CanvasComponentWrapper from "@/components/CanvasComponentWrapper";
import { authOptions } from "@/lib/authOptions";
import axios from "axios";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

async function getRoomId(roomName: string): Promise<string | null> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.accessToken || session.expires < new Date().toISOString()) {
        redirect("/signin");
    }
    try {
        const response = await axios.get(
            `${process.env.BACKEND_URL}/api/users/room/${roomName}`,
            {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            }
        );
        return response.data.roomId ?? null;
    } catch (error) {
        console.error("[getRoomId] Failed to fetch room:", error);
        return null;
    }
}

export default async function CanvasPage({ params }: { params: Promise<{ roomName: string }> }) {
    const { roomName } = await params;
    const roomId = await getRoomId(roomName);

    // TODO handle case where roomId is null (e.g., show error message or redirect)

    if (!roomId) {
        redirect("/");
    }

    return (
        <div>
            <CanvasComponentWrapper roomId={roomId} roomName={roomName} />
        </div>
    );
}