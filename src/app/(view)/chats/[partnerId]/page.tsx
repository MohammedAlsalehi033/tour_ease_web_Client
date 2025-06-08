'use client';
import "reflect-metadata";
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { io, Socket } from 'socket.io-client';
import { ApiService } from "@/app/services/apiService";

// --- Best Practice: Initialize Socket outside the component ---
// This prevents the socket from being re-initialized on every render.
const socket: Socket = io(new ApiService().baseUrl2.split("/api")[0], {
    autoConnect: false, // Important: prevent auto-connection
});

export default function Page() {
    const { data: session } = useSession();
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }

        // --- Connection Logic ---
        // If the socket is not already connected, connect it.
        if (!socket.connected) {
            socket.connect();
        }

        const onConnect = () => {
            console.log("Socket connected!");
                socket.emit('user_connected', session.user.id); // Emitting a custom event

            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log("Socket disconnected.");
            setIsConnected(false);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on("new_message", (message)=>{console.log(message)})


        return () => {
            console.log("Cleaning up socket listeners.");
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
  
            socket.disconnect();
        };
    }, [session]); // Dependency array ensures this runs when the session state changes.

    return (
        <div>
            <h2>Socket Connection Status</h2>
            <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
            {session?.user?.id ? (
                <p>User is logged in. Attempting to connect...</p>
            ) : (
                <p>Waiting for user session...</p>
            )}
        </div>
    );
}