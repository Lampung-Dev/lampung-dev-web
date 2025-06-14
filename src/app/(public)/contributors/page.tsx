import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Contributors",
};

type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

type Designer = {
  name: string;
  avatar_url: string;
  portfolio_url: string;
};

// Manually added designers as requested in the issue
const designers: Designer[] = [
  {
    name: "Amir Faisal",
    avatar_url: "https://avatars.githubusercontent.com/u/85594075?v=4",
    portfolio_url: "https://github.com/amirfaisalz",
  },
];

const ContributorCard = ({ contributor }: { contributor: Contributor }) => (
  <div className="w-full border border-white flex flex-col justify-center items-center p-4 md:p-6 rounded-lg backdrop-blur-sm bg-green-600/10 transition-all hover:scale-105 hover:shadow-lg">
    <Link href={contributor.html_url} target="_blank" rel="noopener noreferrer">
      <Image
        src={contributor.avatar_url}
        alt={`${contributor.login}'s avatar`}
        width={112}
        height={112}
        className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-primary"
      />
    </Link>
    <h3 className="mt-3 md:mt-4 text-base md:text-lg text-center font-medium line-clamp-2">
      {contributor.login}
    </h3>
    <p className="mt-1 text-sm text-gray-400">
      {contributor.contributions} contributions
    </p>
  </div>
);

const DesignerCard = ({ designer }: { designer: Designer }) => (
  <div className="w-full border border-white flex flex-col justify-center items-center p-4 md:p-6 rounded-lg backdrop-blur-sm bg-green-600/10 transition-all hover:scale-105 hover:shadow-lg">
    <Link
      href={designer.portfolio_url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
        src={designer.avatar_url}
        alt={`${designer.name}'s avatar`}
        width={112}
        height={112}
        className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-primary"
      />
    </Link>
    <h3 className="mt-3 md:mt-4 text-base md:text-lg text-center font-medium line-clamp-2">
      {designer.name}
    </h3>
    <p className="mt-1 text-sm text-gray-400">Designer</p>
  </div>
);

export default async function ContributorsPage() {
  let contributors: Contributor[] = [];
  try {
    const res = await fetch(
      "https://api.github.com/repos/Lampung-Dev/lampung-dev-web/contributors",
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );
    if (res.ok) {
      contributors = await res.json();
    } else {
      console.error("Failed to fetch contributors:", res.statusText);
    }
  } catch (error) {
    console.error("Error fetching contributors:", error);
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Code Contributors</h1>
        <p className="text-gray-400 mt-2">
          Special thanks to these amazing developers who have contributed to our
          codebase.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-6">
          {contributors.map((contributor) => (
            <ContributorCard
              key={contributor.login}
              contributor={contributor}
            />
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Design Contributors</h1>
        <p className="text-gray-400 mt-2">
          Our heartfelt appreciation to the creative minds behind our design.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-6">
          {designers.map((designer) => (
            <DesignerCard key={designer.name} designer={designer} />
          ))}
        </div>
      </div>
    </div>
  );
}
