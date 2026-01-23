import React from 'react';

interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
    disablePadding?: boolean;
}

export default function MobileContainer({
    children,
    className = "",
    disablePadding = false
}: MobileContainerProps) {
    return (
        <div className="min-h-screen w-full flex justify-center bg-[#1a1a1a] overflow-hidden">
            {/* Mobile Frame */}
            <div className={`
            w-full max-w-[480px] 
            min-h-[100dvh] 
            relative 
            bg-white 
            shadow-[0_0_50px_rgba(0,0,0,0.5)] 
            flex flex-col
            ${disablePadding ? '' : 'px-4'}
            ${className}
        `}>
                {children}
            </div>
        </div>
    );
}
