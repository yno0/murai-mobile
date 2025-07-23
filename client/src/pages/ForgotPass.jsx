import React from 'react';

const EmailSent = () => {
    return (  
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-semibold text-center mb-6">Email Sent</h2>
                <p className="text-gray-600 mb-4">A password reset link has been sent to your email address.</p>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition duration-200"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

const ForgotPassword = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-semibold text-center mb-6">Forgot Password</h2>
                <p className="text-gray-600 mb-4">Enter your email address to reset your password.</p>
                <form>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition duration-200"
                    >
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;