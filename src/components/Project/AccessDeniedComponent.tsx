import { useRequestJoinMutation } from "@/redux/api/Board";
import { CheckCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

const AccessDeniedComponent = ({ statusData }) => {
    const { id } = useParams<{ id: string }>();
    const [requestSent, setRequestSent] = useState(false);
    const [requestJoin, { isLoading: joinLoading }] = useRequestJoinMutation();


    const handleRequestJoin = useCallback(async () => {
        try {
            await requestJoin({ boardId: id! }).unwrap();
            setRequestSent(true);
        } catch {
            alert('Failed to send request. Please try again later.');
        }
    }, [requestJoin, id]);
    return (
        <div className='pt-16'>
            <div className='max-w-[500px] mx-auto text-center border border-border bg-gray-200 p-6 rounded-lg shadow-md'>
                <img
                    src="https://trello.com/assets/3c7105ff523d79abba48.svg"
                    alt="Private board"
                    className='w-40 mx-auto mb-6'
                />
                <h2 className='text-2xl font-bold mb-4 text-gray-700'>
                    {requestSent || statusData?.status !== 'allowed' ? 'Request sent' : 'This board is private'}
                </h2>
                {requestSent || statusData?.status !== 'allowed' ? (
                    <p className='text-gray-600 flex items-center justify-center gap-2'>
                        <CheckCircle className='text-green-500 w-5' />
                        You'll get an email if you're approved to join.
                    </p>
                ) : (
                    <>
                        <p className='text-gray-600 mb-8'>
                            Send a request to this board's admins to get access. If you're approved to join, you'll receive an email.
                        </p>
                        <p className='mb-3 text-xs text-left text-gray-600'>
                            By requesting access, you agree to share your Atlassian account information with the board admins.
                        </p>
                        <button
                            onClick={handleRequestJoin}
                            className='bg-blue-600 text-white hover:bg-blue-700 w-full py-1.5 rounded disabled:opacity-50 transition-colors'
                            disabled={joinLoading}
                        >
                            {joinLoading ? 'Sending request...' : 'Send Request'}
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default AccessDeniedComponent