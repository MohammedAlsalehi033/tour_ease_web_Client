'use client';
import "reflect-metadata";
import { useEffect, useState, useRef } from 'react';
import { useSession } from "next-auth/react";
import { io, Socket } from 'socket.io-client';
import { ApiService } from "@/app/services/apiService";
import { ChatMessage } from "@/app/(model)/chat/chatModel";
import { container } from "tsyringe";
import { ChatController } from "@/app/(controller)/chat/chatController";
import { useParams } from 'next/navigation'


const socket: Socket = io(new ApiService().baseUrl.split("/api")[0], {
    autoConnect: false,
});

export default function Page() {
    const { data: session } = useSession();
    const [isConnected, setIsConnected] = useState(socket.connected);
    const chatController = container.resolve(ChatController);
    const params = useParams();
    const [partnerId, setPartnerId] = useState<string>(params.partnerId as string);
    const [partnerName, setPartnerName] = useState<string>("Partner");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

  
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    useEffect(() => {
        console.log("session changed", session);
        console.log("partnerId changed", partnerId);
        if (!session?.user?.id) {
            return;
        }

        const fetchMessages = async () => {
            const initialMessages = await chatController.fetchMessages(session.user.id, partnerId);
            setMessages(initialMessages);
            
        }
        fetchMessages();

        if (!socket.connected) {
            socket.connect();
        }

        const onConnect = () => {
            socket.emit('user_connected', session.user.id);
            setIsConnected(true);
        };

 
        const onNewMessage = (message: ChatMessage) => {
            setMessages(prevMessages => [...prevMessages, message]);
        };

        // Register socket event listeners
        socket.on('connect', onConnect);
        socket.on("new_message", onNewMessage);

        return () => {
            console.log("Cleaning up socket listeners.");
            socket.off('connect', onConnect);
            socket.off("new_message", onNewMessage); // Correctly removes the named listener
            socket.disconnect();
        };
    }, [ partnerId, session]);

    const handleSendMessage = async () => {
            if (!session?.user?.id) {
            return;
        }

        if (!messageInputRef.current?.value) {
            alert("Please enter a message");
            return;
        }

        const message : ChatMessage = {
            senderId: session.user.id,
            receiverId: partnerId,
            content: messageInputRef.current?.value || "",
            sentAt: new Date().toISOString(),
            id: 0
        }
        const sentMessage = await chatController.sendMessage(message);
        setMessages(prevMessages => [...prevMessages, sentMessage]);
    }

    return (
        <div>
            
            <div className="flex flex-col gap-3 py-4 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwnMessage = message.senderId === session?.user?.id;
                        return (
                            <div
                                key={message.id}
                                className={`chat-message max-w-[70%] p-3 rounded-lg ${ // Added padding for better visuals
                                    isOwnMessage
                                        ? 'self-end bg-primary-light text-right text-dark-text'
                                        : 'self-start bg-light-surface dark:bg-dark-surface text-left'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {!isOwnMessage && (
                                        <span className="text-xs font-semibold text-primary">
                                            {partnerName}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                                        {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="whitespace-pre-line break-words text-body-md">
                                    {message.content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="fixed bottom-0 right-8 w-full lg:w-[calc(100%-20rem)] bg-transparent px-4 py-3 flex gap-2 z-10 ">
                <input
                    type="text"
                    placeholder="Message"
                    className="input flex-1 min-w-0"
                    ref={messageInputRef}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && messageInputRef.current) {
                            handleSendMessage();
                            messageInputRef.current.focus();
                        }
                    }}
                />
                <button
                    className="btn-primary px-6 py-4 text-sm"
                    onClick={handleSendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
