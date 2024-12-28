'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectPlatform from "./select-platform";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SocialMediaLink } from "@/types/user";

type User = {
    name: string;
    email: string;
    avatar: string;
}

export default function ProfileForm({ user }: { user: User }) {
    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    const [title, setTitle] = useState('')
    const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([
        { platform: '', url: '' }
    ]);


    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Add your form submission logic here
        console.log({ name, email, title, socialMediaLinks });

        // try {
        //     const update = await updateUserAction({ name, email, title, socialMediaLinks })

        //     console.log(update)

        // } catch (error) {
        //     console.log('Error update profile:', error)
        //     toast('Error Update Profil')
        // }

    };

    // Update state when user prop changes
    useEffect(() => {
        setName(user.name);
        setEmail(user.email);
    }, [user]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    placeholder="Name"
                    value={name}
                    onChange={handleNameChange}
                />
            </div>
            <div className="grid w-full max-w-sm items-center gap-2 mt-4">
                <Label htmlFor="email">Email</Label>
                <Input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={email}
                    className="cursor-not-allowed"
                    readOnly
                />
            </div>
            <div className="grid w-full max-w-sm items-center gap-2 mt-4">
                <Label htmlFor="title">Title</Label>
                <Input
                    type="text"
                    id="title"
                    placeholder="Title"
                    value={title}
                    onChange={handleTitleChange}
                />
            </div>

            <SelectPlatform setSocialMediaLinks={setSocialMediaLinks} socialMediaLinks={socialMediaLinks} />

            <div className="flex justify-end mt-8">
                <Button type="submit" className="w-36">Save</Button>
            </div>
        </form>
    )
}