'use client'

import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { SocialMediaLink, SocialPlatform } from '@/types/user';

const SOCIAL_PLATFORMS: Record<SocialPlatform, string> = {
    x: "X",
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
    setSocialMediaLinks: Dispatch<SetStateAction<SocialMediaLink[]>>;
    hasError?: boolean;
    onValidationChange?: (isValid: boolean) => void;
}

export default function SelectPlatform({
    socialMediaLinks,
    setSocialMediaLinks,
    hasError,
    onValidationChange
}: SelectPlatformProps) {
    const [errors, setErrors] = React.useState<Record<number, { platform?: boolean; url?: boolean }>>({});

    const validateFields = () => {
        const newErrors: Record<number, { platform?: boolean; url?: boolean }> = {};
        let hasErrors = false;

        socialMediaLinks.forEach((link, index) => {
            newErrors[index] = {
                platform: !link.platform,
                url: !link.url.trim()
            };
            if (!link.platform || !link.url.trim()) {
                hasErrors = true;
            }
        });

        setErrors(newErrors);
        onValidationChange?.(!hasErrors);
        return !hasErrors;
    };

    useEffect(() => {
        if (socialMediaLinks.length > 0) {
            validateFields();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socialMediaLinks]);

    const addSocialMedia = (): void => {
        setSocialMediaLinks([...socialMediaLinks, { platform: '', url: '' }]);
    };

    const removeSocialMedia = (index: number): void => {
        const newLinks = socialMediaLinks.filter((_, i) => i !== index);
        setSocialMediaLinks(newLinks);

        const newErrors = { ...errors };
        delete newErrors[index];
        setErrors(newErrors);

        if (newLinks.length === 0) {
            onValidationChange?.(true);
        }
    };

    const updateSocialMedia = (index: number, field: keyof SocialMediaLink, value: string): void => {
        const newLinks = [...socialMediaLinks];
        newLinks[index][field] = value;
        setSocialMediaLinks(newLinks);

        const newErrors = { ...errors };
        newErrors[index] = {
            ...newErrors[index],
            [field]: !value.trim()
        };
        setErrors(newErrors);

        onValidationChange?.(!Object.values(newErrors).some(err => err.platform || err.url));
    };

    const isPlatformSelected = (platform: string): boolean => {
        return socialMediaLinks.some(link => link.platform === platform);
    };

    return (
        <div className="space-y-4 mt-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
                <p className="text-xl text-primary">Social Media</p>
                {socialMediaLinks.length < 8 &&
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addSocialMedia}
                        className="flex items-center gap-2 mt-4 md:mt-0"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Add Platform
                    </Button>
                }
            </div>

            {socialMediaLinks.map((link, index) => (
                <div key={index} className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="grid w-full md:max-w-[200px] gap-1.5">
                            <div className="min-h-[76px]">
                                <Label className="flex items-center gap-1">
                                    Platform {index + 1}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={link.platform}
                                    onValueChange={(value: string) => updateSocialMedia(index, 'platform', value)}
                                >
                                    <SelectTrigger className={`mt-1.5 ${errors[index]?.platform ? 'border-red-500' : ''}`}>
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
                                {(errors[index]?.platform) && !link.platform && (
                                    <p className="text-sm text-red-500 mt-1">Platform is required</p>
                                )}
                            </div>
                        </div>
                        <div className="grid w-full gap-1.5">
                            <div className="min-h-[76px]">
                                <Label className="flex items-center gap-1">
                                    URL
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://"
                                    value={link.url}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        updateSocialMedia(index, 'url', e.target.value)}
                                    maxLength={100}
                                    className={`mt-1.5 ${errors[index]?.url ? 'border-red-500' : ''}`}
                                    required
                                />
                                {(errors[index]?.url || hasError) && !link.url.trim() && (
                                    <p className="text-sm text-red-500 mt-1">URL is required</p>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSocialMedia(index)}
                            className="md:mt-0 w-full md:w-10 bg-black/20 border"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}