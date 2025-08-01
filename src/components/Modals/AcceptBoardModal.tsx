import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const AcceptBoardModal = ({ isOpen, onClose, onAccept, boardName }) => {
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Join Board</DialogTitle>
                    <DialogDescription>
                        {`You have been invited to join the board "${boardName}".`}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm mb-4">Do you want to accept this invitation and join the board?</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onAccept}>Join Board</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AcceptBoardModal;
