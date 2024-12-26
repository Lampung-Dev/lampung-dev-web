'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectPlatform from "./select-platform";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type User = {
    name: string;
    email: string;
    avatar: string;
}

export default function ProfileForm({ user }: { user: User }) {
    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    const [title, setTitle] = useState('')

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add your form submission logic here
        console.log({ name, email, title });
    };

    // Update state when user prop changes
    useEffect(() => {
        setName(user.name);
        setEmail(user.email);
    }, [user]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    placeholder="Name"
                    value={name}
                    onChange={handleNameChange}
                />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                    type="text"
                    id="title"
                    placeholder="Title"
                    value={title}
                    onChange={handleTitleChange}
                />
            </div>

            <SelectPlatform />

            <div className="flex justify-end mt-8">
                <Button type="submit" className="w-36">Save</Button>
            </div>
        </form>
    )
}