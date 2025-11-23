export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            width: '100%',
            padding: '20px 0',
            marginTop: 'auto'
        }}>
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4" style={{ fontSize: '14px', color: '#ffffff' }}>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="#A8C9AD" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span>
                            Developed by <span style={{ color: '#A8C9AD', fontWeight: 'bold' }}>Naveen Akalanka</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="#ffffff" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span>© {currentYear} ScanEye. All rights reserved.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
