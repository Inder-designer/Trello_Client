import React, { useRef } from 'react';
import { Button, Popper, Paper, ClickAwayListener, Typography, Stack } from '@mui/material';
import { X } from 'lucide-react';
import Loader from '../Loaders/Loader';

interface Props {
    anchorEl?: HTMLElement | null;
    onClose: () => void;
    onConfirm: () => void;
    isOpen: boolean;
    isLoading: boolean;
    title?: string;
    des?: string;
    btnText?: string;
    placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
}

const ConfirmPopup: React.FC<Props> = ({ title, des, btnText, placement = "top-start", anchorEl, onClose, onConfirm, isOpen, isLoading }) => {
    return (
        <Popper
            open={isOpen}
            anchorEl={anchorEl}
            placement={placement}
            modifiers={[
                {
                    name: 'flip',
                    enabled: true,
                    options: {
                        altBoundary: true,
                        rootBoundary: 'viewport',
                        padding: 8,
                    },
                },
                {
                    name: 'offset',
                    options: {
                        offset: [0, 8],
                    },
                },
            ]}
            disablePortal
        >
            <ClickAwayListener onClickAway={onClose}>
                <div className='bg-white p-2 rounded shadow-[0px_0px_12px_4px_#0000002d] w-max max-w-[250px]' onClick={(e) => e.stopPropagation()}>
                    <div className='flex items-center justify-between mb-2'>
                        <h4 className='text-sm font-medium text-gray-800'>{title}</h4>
                        <button
                            onClick={onClose}
                            className='text-gray-500 hover:text-gray-800'
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <p className='text-sm text-gray-600'>{des}</p>
                    <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1}>
                        {isLoading ?
                            <div className='h-[30.75px] flex items-center justify-center px-3.5'>
                                <Loader />
                            </div>
                            :
                            <Button size="small" color="error" className='!capitalize' onClick={onConfirm}>
                                {btnText}
                            </Button>
                        }
                    </Stack>
                </div>
            </ClickAwayListener>
        </Popper>
    );
};

export default ConfirmPopup;
