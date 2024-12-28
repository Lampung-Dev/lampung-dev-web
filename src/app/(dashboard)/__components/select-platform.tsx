'use client'

import React, { Dispatch, SetStateAction } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { SocialMediaLink, SocialPlatform } from '@/types/user';

const SOCIAL_PLATFORMS: Record<SocialPlatform, string> = {
    twitter: "Twitter",
    linkedin: "LinkedIn",
    github: "GitHub",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    tiktok: "TikTok",
    "personal website": "Personal Website"
} as const;

type SelectPlatformProps = {
    socialMediaLinks: SocialMediaLink[];
    setSocialMediaLinks: Dispatch<SetStateAction<SocialMediaLink[]>>
}

export default function SelectPlatform({
    socialMediaLinks, setSocialMediaLinks
}: SelectPlatformProps) {
    const addSocialMedia = (): void => {
        setSocialMediaLinks([...socialMediaLinks, { platform: '', url: '' }]);
    };

    const removeSocialMedia = (index: number): void => {
        const newLinks = socialMediaLinks.filter((_, i) => i !== index);
        setSocialMediaLinks(newLinks);
    };

    const updateSocialMedia = (index: number, field: keyof SocialMediaLink, value: string): void => {
        const newLinks = [...socialMediaLinks];
        newLinks[index][field] = value;
        setSocialMediaLinks(newLinks);
    };

    const isPlatformSelected = (platform: string): boolean => {
        return socialMediaLinks.some(link => link.platform === platform);
    };

    return (
        <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
                <p className="text-xl text-primary">Social Media</p>
                {socialMediaLinks.length < 8 &&
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addSocialMedia}
                        className="flex items-center gap-2"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Add Platform
                    </Button>
                }
            </div>

            {socialMediaLinks.map((link, index) => (
                <div key={index} className="flex items-end gap-4">
                    <div className="grid w-full max-w-[200px] items-center gap-1.5">
                        <Label>Platform {index + 1}</Label>
                        <Select
                            value={link.platform}
                            onValueChange={(value: string) => updateSocialMedia(index, 'platform', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.entries(SOCIAL_PLATFORMS) as [SocialPlatform, string][]).map(([value, label]) => (
                                    <SelectItem
                                        key={value}
                                        value={value}
                                        disabled={isPlatformSelected(value) && link.platform !== value}
                                    >
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label>URL</Label>
                        <Input
                            type="url"
                            placeholder="https://"
                            value={link.url}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateSocialMedia(index, 'url', e.target.value)}
                        />
                    </div>
                    {index > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSocialMedia(index)}
                            className="mb-0.5"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    )
}