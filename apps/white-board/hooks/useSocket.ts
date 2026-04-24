import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useSocket(){
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        if(status === "loading") return;
        
        const token = session?.user?.accessToken;
        if(!token){
            setLoading(false);
            return;
        }
        
        let cancelled = false;
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);

        ws.onopen = () => {
            if(cancelled) { ws.close(); return; }
            setLoading(false);
            setSocket(ws);
        }
        
        return () => {
            cancelled = true;
            if(ws.readyState === WebSocket.OPEN){
                ws.close();
            }
        }
    }, [session?.user?.accessToken, status]);

    return { loading, socket };
}