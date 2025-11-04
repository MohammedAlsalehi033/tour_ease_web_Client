'use client'

import { signOut } from "next-auth/react";

export const SignoutButton = () => {
    
    return (
        <button
        className="btn btn- bg-red-500 hover:bg-red-600"
        onClick={() => {
            signOut();
        }}
        >
        Sign out
        </button>
    );
    }