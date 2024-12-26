import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className='w-full h-full flex justify-center items-center'>
            <div className="flex flex-col items-center justify-center gap-6 bg-black/10 backdrop-blur-sm p-6 md:p-10 rounded-xl border w-80 aspect-square">
                <div className="flex w-full max-w-sm flex-col gap-6 items-center">
                    <h2 className='text-white font-bold text-3xl mb-8'>Page Not Found</h2>
                    <Link href="/dashboard">
                        <Button>
                            Return to dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}