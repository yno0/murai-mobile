import React, { useEffect } from "react";
import { Outlet, Routes, Route, useSearchParams } from 'react-router-dom';
import { ClientSidebar } from '../components/client/sidebar';
import Home from '../pages/client/Home';
import Detection from '../pages/client/Detection';
import Extension from '../pages/client/Extension';
import Group from '../pages/client/Group';
import Help from '../pages/client/Help';

export default function ClientLayout() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Handle authentication parameters from Google OAuth or other auth flows
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');

        if (token && email) {
            // Store authentication data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email, name }));
            
            // Clear URL parameters after storing
            const url = new URL(window.location);
            url.search = '';
            window.history.replaceState({}, '', url);
        }
    }, [searchParams]);

    return (
        <div className="flex">
           <ClientSidebar/>
            <main className="flex-1 p-6 ">
                <Routes>
                  <Route path="dashboard" element={<Home />} />
                  <Route path="detections" element={<Detection />} />
                  <Route path="extension" element={<Extension />} />
                  <Route path="group" element={<Group />} />
                  <Route path="help" element={<Help />} />
                </Routes>
                <Outlet />
            </main>
        </div>
    );
}