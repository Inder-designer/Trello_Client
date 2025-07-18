import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAcceptInviteMutation, useVerifyInviteLinkMutation } from '@/redux/api/Board';
import { getInviteToken, } from '@/utils/inviteToken';
import { toast } from 'sonner';

const AcceptBoard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [verifyToken] = useVerifyInviteLinkMutation();
    const [acceptInvite, { isLoading: joinLoading }] = useAcceptInviteMutation();
    const [board, setBoard] = useState(location.state?.board || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isOpen = true;

    const onClose = () => {
        navigate('/boards');
    };

    useEffect(() => {
        const verify = async () => {
            let token = '';
            let isAlreadyVerified = false;
            if (location.state?.verified && location.state?.board) {
                setBoard(location.state.board);
                navigate(location.pathname, { replace: true }); // clear state
                return;
            }

            const cookieData = getInviteToken();
            if (cookieData?.token) {
                token = cookieData.token;
                isAlreadyVerified = cookieData.verified;
            }

            if (!token) {
                navigate('/boards');
                return;
            }

            if (isAlreadyVerified && board) {
                return;
            }

            setLoading(true);
            try {
                const response = await verifyToken({ token }).unwrap();

                if (response.isMember) {
                    navigate(`/board/${response.boardId}`);
                    toast.success(`You are already a member of the board "${response.boardTitle}".`);
                } else {
                    setBoard(response);
                }
            } catch (err) {
                console.error("Token verification failed:", err);
                setError('Invalid or expired invite link.');
            } finally {
                setLoading(false);
            }
        };


        verify();
    }, [location.state, navigate, verifyToken]);

    const onAccept = async () => {
        await acceptInvite({ token: board?.inviteToken }).unwrap()
            .then(() => {
                // react-router-dom state:board
                navigate(`/board/${board?.boardId}`);
            })
            .catch((err) => {
                setError(err?.data?.message || "Failed to join the board");
                onClose();
            });
    };

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[400px] text-center">
                    <div>
                        <h4 className='font-medium text-lg'>{error ? "You can't join this board" : "Join Board"}</h4>
                        {/* subtitle */}
                        <p className='text-black/60 text-sm mt-1'>
                            {loading ? 'Verifying invite link...' : error ? 'The invitation link may have been disabled or this free Workspace may have reached the 10 collaborator limit. You can request to join the board or try contacting the person who sent you the link.' : `You have been invited to join the board "${board?.boardTitle}".`}
                        </p>
                        {!loading && !error && (
                            <>
                                <div className="mt-4">
                                    <p className="text-lg mb-2"><span className='capitalize font-medium'>{board?.owner?.fullName}</span> shared <span className='capitalize font-medium'>{board?.boardTitle}</span> with you</p>
                                </div>
                                <div className='flex justify-center gap-3'>
                                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                                    <Button onClick={onAccept} disabled={joinLoading}>{joinLoading ? "Joining..." : "Join Board"}</Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AcceptBoard;