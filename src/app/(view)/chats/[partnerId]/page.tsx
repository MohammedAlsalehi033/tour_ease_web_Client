'use client';
import "reflect-metadata";
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { io, Socket } from 'socket.io-client';
import { ApiService } from "@/app/services/apiService";
import { ChatMessage } from "@/app/(model)/chat/chatModel";
import { container } from "tsyringe";
import { ChatController } from "@/app/(controller)/chat/chatController";
import { useParams } from 'next/navigation'


const socket: Socket = io(new ApiService().baseUrl2.split("/api")[0], {
    autoConnect: false, 
});

export default function Page() {
    const { data: session } = useSession();
    const [isConnected, setIsConnected] = useState(socket.connected);
    const chatController = container.resolve(ChatController);
    const params = useParams();
    const [partnerId, setPartnerId] = useState<string>(params.partnerId as string);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    useEffect(() => {
        const fetchMessages = async () => {
            if (!session?.user?.id) {
            return;
        }

        const messages = await chatController.fetchMessages(session.user.id, partnerId);
        setMessages(messages);
        }
        fetchMessages();

        if (!socket.connected) {
            socket.connect();
        }

        const onConnect = () => {
                socket.emit('user_connected', session.user.id); // Emitting a custom event

            setIsConnected(true);
        };

       

        socket.on('connect', onConnect);
        socket.on("new_message", (message: ChatMessage)=>{
            setMessages([...messages, message])
        })


        return () => {
            console.log("Cleaning up socket listeners.");
            socket.off('connect', onConnect);
            socket.off("new_message", (message: ChatMessage)=>{
                console.log(message)
                setMessages([...messages, message])
            })
            socket.disconnect();
        };
    }, [session]); 

    return (
        <div>
            <h2>Socket Connection Status</h2>
            <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
            {session?.user?.id ? (
                <p>User is logged in. Attempting to connect...</p>
            ) : (
                <p>Waiting for user session...</p>
            )}
            <div className="flex flex-col gap-2">
                {messages.map((message) => (
                    <div key={message.id} className={`chat-message flex-1 ${message.senderId === session?.user?.id ? 'self-end bg-primary-light' : 'self-start'}`}>
                        {message.content}
                        <p>{message.sentAt}</p>
                        <p>{message.senderId}</p>
                        <p>{message.receiverId}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}