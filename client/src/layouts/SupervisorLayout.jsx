import { Outlet } from "react-router-dom";
import { SupervisorSidebar } from "../components/supervisor/sidebar";

export default function SupervisorLayout() {
    return (
        <div className="flex">
            <SupervisorSidebar/>
            <main className="flex-1 p-6 bg-gray-100">
                <Outlet />
            </main>
        </div>
    );
}