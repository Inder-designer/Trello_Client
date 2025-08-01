import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

interface DropdownSeparatorProps {
  className?: string;
}

type CustomDropdownComponent = React.FC<DropdownProps> & {
  Item: React.FC<DropdownItemProps>;
  Separator: React.FC<DropdownSeparatorProps>;
};

export const CustomDropdown: CustomDropdownComponent = ({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  align = 'end',
  side = 'bottom',
  className = '',
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  
  const setOpen = useCallback((open: boolean) => {
    if (isControlled) {
      onOpenChange?.(open);
    } else {
      setInternalOpen(open);
    }
  }, [isControlled, onOpenChange]);

  // Calculate position
  const getPosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 };
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    let top = 0;
    let left = 0;
    
    // Vertical positioning
    if (side === 'bottom') {
      top = triggerRect.bottom + scrollTop + 4;
    } else if (side === 'top') {
      top = triggerRect.top + scrollTop - 4;
    }
    
    // Horizontal positioning
    if (align === 'start') {
      left = triggerRect.left + scrollLeft;
    } else if (align === 'center') {
      left = triggerRect.left + scrollLeft + triggerRect.width / 2;
    } else if (align === 'end') {
      left = triggerRect.right + scrollLeft;
    }
    
    return { top, left };
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setOpen]);

  const position = getPosition();

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => setOpen(!isOpen)}
        className="inline-block"
      >
        {trigger}
      </div>
      
      {isOpen && createPortal(
        <div
          ref={contentRef}
          className={`
            fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md
            ${align === 'end' ? '-translate-x-full' : ''}
            ${align === 'center' ? '-translate-x-1/2' : ''}
            ${side === 'top' ? '-translate-y-full' : ''}
            ${className}
          `}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
};

export const CustomDropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
}) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none
        ${disabled 
          ? 'pointer-events-none opacity-50' 
          : 'cursor-pointer hover:bg-gray-100 focus:bg-gray-100'
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CustomDropdownSeparator: React.FC<DropdownSeparatorProps> = ({
  className = '',
}) => {
  return (
    <div className={`-mx-1 my-1 h-px bg-gray-200 ${className}`} />
  );
};

// Compound component pattern
CustomDropdown.Item = CustomDropdownItem;
CustomDropdown.Separator = CustomDropdownSeparator;
