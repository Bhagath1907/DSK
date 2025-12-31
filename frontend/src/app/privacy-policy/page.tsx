import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

                {/* Header */}
                <div className="bg-sky-500 p-8 text-white">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold">Privacy Policy & Terms of Service</h1>
                    <p className="mt-2 text-brand-light/90">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="p-8 md:p-12 space-y-12 text-gray-700 leading-relaxed">

                    {/* Section 1: Data Collection */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            Data Collected During Signup
                        </h2>
                        <p className="mb-4">To provide our services, we collect the following Personally Identifiable Information (PII) when you create an account:</p>
                        <ul className="list-disc pl-6 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <li><strong>Full Name:</strong> To identify you in our system.</li>
                            <li><strong>Email Address:</strong> For communication and account verification.</li>
                            <li><strong>Phone Number:</strong> For urgent updates and service notifications.</li>
                            <li><strong>Password:</strong> Encrypted using industry-standard cryptographic hashing (never stored in plain text).</li>
                            <li><strong>Uploaded Documents:</strong> PDFs, images, and certificates required for service applications.</li>
                            <li><strong>IP Address:</strong> Logged for security monitoring and fraud prevention.</li>
                        </ul>
                    </section>

                    {/* Section 2: Data Storage */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                            How User Data Is Stored
                        </h2>
                        <p>We prioritize the security of your data (Encryption at Rest):</p>
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <h3 className="font-bold text-purple-900 mb-1">Databases</h3>
                                <p className="text-sm">Data is stored in secure, restricted-access databases protected by firewalls.</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <h3 className="font-bold text-blue-900 mb-1">Files</h3>
                                <p className="text-sm">Uploaded documents are stored in secure storage buckets with strict access controls.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Data Usage */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                            How Data Is Used
                        </h2>
                        <ul className="list-check space-y-2 mb-4">
                            <li>✅ Processing your service applications.</li>
                            <li>✅ verifying your identity for security purposes.</li>
                            <li>✅ Legal compliance and fraud monitoring.</li>
                        </ul>
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 font-medium text-center">
                            ❌ We do NOT sell your personal data to third parties.
                        </div>
                    </section>

                    {/* Section 4: Admin Access */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-orange-100 text-orange-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                            Admin Access Control
                        </h2>
                        <p className="mb-4">We use <strong>Role-Based Access Control (RBAC)</strong> to ensure that only authorized personnel can access your data.</p>
                        <p>Only verified Admins can view applications, download documents, and approve/reject services. All admin actions are logged for audit purposes.</p>
                    </section>

                    {/* Section 5: Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
                            Security Measures
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                            <div className="p-3 bg-gray-50 border rounded-lg">🔒 SSL/TLS Encryption</div>
                            <div className="p-3 bg-gray-50 border rounded-lg">🤖 CAPTCHA Protection</div>
                            <div className="p-3 bg-gray-50 border rounded-lg">🛡️ Rate Limiting</div>
                            <div className="p-3 bg-gray-50 border rounded-lg">👁️ Audit Logs</div>
                        </div>
                    </section>

                    {/* Section 6: User Rights */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
                            Your Rights
                        </h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>View the personal data we hold about you.</li>
                            <li>Request updates to incorrect information.</li>
                            <li>Request deletion of your account (subject to legal retention requirements).</li>
                        </ul>
                    </section>

                    {/* Section 7: Updates */}
                    <div className="border-t pt-8 text-sm text-gray-500">
                        <h3 className="font-bold text-gray-900 mb-2">Policy Updates</h3>
                        <p>This policy may change over time. Users will be notified of any major changes via email or platform notifications.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
