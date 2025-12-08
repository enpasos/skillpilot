import React, { useRef, useEffect } from 'react';

interface AutoResizingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    maxHeight?: number;
}

export const AutoResizingTextarea: React.FC<AutoResizingTextareaProps> = ({
    maxHeight = 200,
    className,
    value,
    onChange,
    ...props
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            rows={1}
            className={`resize-none overflow-hidden ${className}`}
            value={value}
            onChange={(e) => {
                adjustHeight();
                if (onChange) onChange(e);
            }}
            {...props}
        />
    );
};
