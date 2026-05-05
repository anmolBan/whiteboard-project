import CreateRoomComponent from "@/components/CreateRoomComponent";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CreateRoomPage(){
    const session = await getServerSession(authOptions);

    if(!session){
        redirect("/signin");
    }

    return (
        <div>
            <CreateRoomComponent />
        </div>
    )
}