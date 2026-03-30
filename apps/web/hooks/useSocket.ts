import { useEffect, useState } from "react";
import { WS_URL } from "../config"

export function useSocket(){
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(!token){
            setLoading(false);
            return;
        }
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return { loading, socket };
}