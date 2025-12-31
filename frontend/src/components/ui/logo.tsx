import Image from 'next/image';

export const DskLogo = ({ className }: { className?: string }) => (
    <Image
        src="/logo.png"
        alt="DSK Logo"
        width={48}
        height={48}
        className={className}
    />
);
