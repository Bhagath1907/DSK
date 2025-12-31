export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-slate-200">
            <main className="flex-1">
                {children}
            </main>
            <footer className="py-8 text-center text-white/80 text-sm font-semibold tracking-wide border-t border-white/10 bg-black/10 backdrop-blur-sm">
                &copy; {new Date().getFullYear()} DSK Portal. All rights reserved.
            </footer>
        </div>
    );
}
