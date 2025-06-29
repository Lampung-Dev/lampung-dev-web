import Link from "next/link";

const Page = () => {
  return (
    <div className="p-4 h-full w-full flex flex-col items-center justify-center space-y-8">
      <h1 className="text-2xl">Admin Page</h1>
      <Link
        href="/admin/members"
        prefetch
        className="bg-primary text-black px-4 py-2 rounded"
      >
        Manage Member
      </Link>
    </div>
  );
};

export default Page;
