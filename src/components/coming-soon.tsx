import { SparklesText } from "./sparkles-text";

export default function ComingSoon() {
    return (
        <div className='w-full h-full flex justify-center items-center'>
            <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 rounded-xl">
                <div className="flex w-full flex-col gap-6 items-center justify-center">
                    <SparklesText text="Coming Soon"
                        className="text-4xl md:text-6xl lg:text-7xl font-bold"
                    />
                </div>
            </div>
        </div>
    )
}