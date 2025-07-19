"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";

import { errorHandler } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectPlatform from "./select-platform";
import { Button } from "@/components/ui/button";
import { SocialMediaLink, UserProfile } from "@/types/user";
import { updateUserAction } from "@/actions/update-user-action";
import { Separator } from "@/components/ui/separator";

export default function ProfileForm({ user }: { user: UserProfile }) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [title, setTitle] = useState(user.title);
    const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        name?: boolean;
        title?: boolean;
        socialMedia?: boolean;
    }>({});

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        setErrors((prev) => ({ ...prev, name: !e.target.value.trim() }));
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setErrors((prev) => ({ ...prev, title: !e.target.value.trim() }));
    };

    const validateForm = () => {
        const newErrors = {
            name: !name.trim(),
            title: !title.trim(),
            socialMedia:
                socialMediaLinks.length > 0 &&
                socialMediaLinks.some(
                    (link) => !link.platform || !link.url.trim()
                ),
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(Boolean);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append("name", name);
            formData.append("title", title);
            formData.append("email", email);
            formData.append(
                "socialMediaLinks",
                JSON.stringify(socialMediaLinks)
            );

            await updateUserAction(formData);
            toast.success("Success update profile data.");
        } catch (error) {
            errorHandler({
                error: error as Error,
                secondErrorMessage: "Failed to update profile data.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setName(user.name);
        setEmail(user.email);
        setTitle(user.title || "");
        setSocialMediaLinks(user.socialMediaLinks || []);
    }, [user]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                    Name
                    <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="text"
                    id="name"
                    placeholder="Name"
                    value={name}
                    onChange={handleNameChange}
                    className={errors.name ? "border-red-500" : ""}
                    required
                    maxLength={50}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">Name is required</p>
                )}
            </div>

            <div className="grid w-full max-w-sm items-center gap-2">
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

            <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="title" className="flex items-center gap-1">
                    Title
                    <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="text"
                    id="title"
                    placeholder="Title"
                    value={title}
                    onChange={handleTitleChange}
                    className={errors.title ? "border-red-500" : ""}
                    required
                    maxLength={100}
                />
                {errors.title && (
                    <p className="text-sm text-red-500">Title is required</p>
                )}
            </div>

            <Separator className="mt-4" />

            <SelectPlatform
                setSocialMediaLinks={setSocialMediaLinks}
                socialMediaLinks={socialMediaLinks}
                hasError={errors.socialMedia}
                onValidationChange={(isValid) =>
                    setErrors((prev) => ({ ...prev, socialMedia: !isValid }))
                }
            />

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    className="w-full md:w-36"
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : "Save"}
                </Button>
            </div>
        </form>
    );
}
