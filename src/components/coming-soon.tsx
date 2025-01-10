import { SparklesText } from "./sparkles-text";

export default function ComingSoon() {
    return (
        <div className='w-full h-full flex justify-center items-center'>
            <div className="flex flex-col items-center justify-center gap-6 bg-black/10 backdrop-blur-sm p-6 md:p-10 rounded-xl border w-[40rem] aspect-square">
                <div className="flex w-full max-w-md flex-col gap-6 items-center justify-center">
                    <SparklesText text="Coming Soon" />
                </div>
            </div>
        </div>
    )
}