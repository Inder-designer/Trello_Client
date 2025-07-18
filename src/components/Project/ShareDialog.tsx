import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Check, Copy, User, Users, X } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { toast } from 'sonner'
import { Badge } from '../ui/badge'
import { useDeleteInviteLinkMutation, useGenerateInviteMutation } from '@/redux/api/Board'
import { format } from 'date-fns'

const ShareDialog = ({ isShareDialogOpen, setIsShareDialogOpen, board }) => {
    const [generateInvite, { isLoading }] = useGenerateInviteMutation()
    const [deleteInvite, { isLoading: deleteLoading }] = useDeleteInviteLinkMutation()
    const [iniviteLink, setInviteLink] = useState(board?.inviteToken || "");
    const [copySuccess, setCopySuccess] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
    const joinRequests = board?.joinRequests || [];

    const handleShare = async () => {
        const shareUrl = window.location.href;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopySuccess(true);
            toast("Board link copied!", {
                description: "Share this link with your team members.",
            });
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link", {
                description: "Please copy the URL manually from your browser.",
            });
        }
    };
    const generateInviteLink = async () => {
        try {
            const response = await generateInvite(board._id).unwrap();
            const inviteLink = response.token;
            setInviteLink(inviteLink);
            toast.success("Invite link generated!", {
                description: "You can now copy and share this link with your team members.",
            });
        } catch (error) {
            console.error("Failed to generate invite link:", error);
            toast.error("Failed to generate invite link", {
                description: "Please try again later.",
            });
        }
    }
    return (
        <>
            <Dialog
                open={isShareDialogOpen}
                onOpenChange={(open) => {
                    setShowDeleteConfirm(false);
                    setIsShareDialogOpen(open);
                }}
            >
                <DialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Share
                        {joinRequests.length > 0 &&
                            <span className='text-xs w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full'>{joinRequests.length}</span>
                        }
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Share Board</DialogTitle>
                        <DialogDescription>
                            Share this board with your team members by copying the link below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Board Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={window.location.href}
                                    readOnly
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleShare}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copySuccess ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className='text-sm'>Anyone with the link can join as a member</p>
                            {iniviteLink ? (
                                <div className='flex items-center gap-2'>
                                    <button
                                        className='text-blue-500 hover:underline text-xs underline-offset-2'
                                        onClick={() => {
                                            navigator.clipboard.writeText(`http://localhost:8080/invite/${board._id}?invite-token=${iniviteLink}`);
                                            toast('Invite link copied!', {
                                                description: 'Share this link with your team members.',
                                            });
                                        }}
                                    >
                                        Copy Link
                                    </button>
                                    <span>.</span>
                                    <button
                                        className='text-blue-500 hover:underline text-xs underline-offset-2'
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        Delete Link
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className='text-blue-500 disabled:hover:no-underline hover:underline text-xs underline-offset-2'
                                    onClick={generateInviteLink}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Generating..." : "Create Link"}
                                </button>
                            )}
                        </div>

                        {/* Delete Link Confirmation Dialog */}
                        {showDeleteConfirm && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                                <div className="bg-white rounded shadow-lg p-4 w-80">
                                    <h3 className="text-base font-semibold mb-2">Delete share link?</h3>
                                    <p className="text-sm mb-4">The existing board share link will no longer work.</p>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="px-3 py-1.5 text-xs rounded bg-gray-100 hover:bg-gray-200"
                                            onClick={() => setShowDeleteConfirm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-3 py-1.5 text-xs rounded bg-red-500 text-white disabled:hover:bg-red-500 hover:bg-red-600"
                                            onClick={async () => {
                                                try {
                                                    await deleteInvite(board._id).unwrap();
                                                    setInviteLink('');
                                                    setShowDeleteConfirm(false);
                                                    toast.success('Invite link deleted successfully');
                                                } catch (error) {
                                                    setShowDeleteConfirm(false);
                                                    console.error("Failed to delete invite link:", error);
                                                    toast.error("Failed to delete invite link", {
                                                        description: "Please try again later.",
                                                    });
                                                }
                                            }}
                                            disabled={deleteLoading}
                                        >
                                            {deleteLoading ? 'Deleting...' : 'Delete share link'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <div className='flex items-center gap-4 text-sm border-b border-border'>
                                <button
                                    className={`pb-2 border-b-2 ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}
                                    onClick={() => setActiveTab('members')}
                                >
                                    Board Members
                                </button>
                                <button
                                    className={`pb-2 flex items-center gap-1 border-b-2 ${activeTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}
                                    onClick={() => setActiveTab('requests')}
                                >
                                    Join Requests {joinRequests.length > 0 && <span className='text-xs w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full'>{joinRequests.length}</span>}
                                </button>
                            </div>
                            {activeTab === 'members' ? (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {board?.members.map((member, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span className="text-sm">{member.fullName}</span>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {member.role || 'member'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {joinRequests.length === 0 ? (
                                        <div className="text-gray-500 text-center py-1.5">There are no requests to join this board.</div>
                                    ) : (
                                        joinRequests.map((req, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 bg-red-400 text-white text-xs font-medium rounded-full flex items-center justify-center"
                                                        title={req?.fullName}
                                                    >
                                                        {req?.requestBy?.initials}
                                                    </div>
                                                    <div>
                                                        <span className='text-sm'>{req?.requestBy?.fullName}</span>
                                                        <p className="text-xs text-gray-600">Request sent <span className="-2">{format(new Date(req.createdAt), "MMM dd, yyyy")}</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className='text-sm bg-gray-200 hover:bg-gray-300 duration-300 px-3 py-1.5 rounded' onClick={() => {/* accept logic here */ }}>Accept</button>
                                                    <button className='text-sm bg-gray-200 hover:bg-gray-300 duration-300 px-3 py-1.5 rounded' onClick={() => {/* reject logic here */ }}><X size={16} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsShareDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default ShareDialog