import React, { useState, useRef, useEffect } from "react";
import Logo from "../../assets/Logo.svg";
import { FiHome, FiAlertTriangle, FiTool, FiUserCheck, FiInfo, FiArrowUpRight, FiChevronLeft, FiMenu, FiLogOut, FiSettings, FiUser, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { useLocation } from "react-router-dom";

export function ClientSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [user, setUser] = useState(null);
  const accountMenuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    }
    if (showAccountMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAccountMenu]);

  const menu = [
    { label: "Home", icon: <FiHome />, href: "/client/dashboard" },
    { label: "Detection", icon: <FiAlertTriangle />, href: "/client/detections" },
    { label: "Extension", icon: <FiTool />, href: "/client/extension" },
    { label: "Group", icon: <FiUserCheck />, href: "/client/group" },
    { label: "Help", icon: <FiInfo />, href: "/client/help" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const AccountMenu = (
    <div ref={accountMenuRef} className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 w-48 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col py-2 animate-fade-in">
      <button className="flex items-center gap-2 px-4 py-2 text-[#787878] hover:bg-gray-50 hover:text-black transition text-sm" onClick={() => setShowAccountMenu(false)}>
        <FiSettings /> <span>Settings</span>
      </button>
      <button className="flex items-center gap-2 px-4 py-2 text-[#787878] hover:bg-gray-50 hover:text-black transition text-sm" onClick={handleLogout}>
        <FiLogOut /> <span>Logout</span>
      </button>
    </div>
  );

  return (
    <aside
      className={`bg-white h-screen flex flex-col justify-between border-r border-gray-100 shadow-sm transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}
      style={{ fontFamily: 'Poppins, sans-serif', position: 'relative' }}
    >
      {/* Top: Toggle Button (closed) and Logo/Menu (open) */}
      <div>
        {!isOpen && (
          <div className="flex items-center mb-16 mt-2 justify-center" style={{ minHeight: 56 }}>
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition mx-auto"
              onClick={() => setIsOpen(true)}
              aria-label="Open sidebar"
            >
              <FiMenu size={22} />
            </button>
          </div>
        )}
        <div className={`flex flex-col ${isOpen ? "pl-7 pr-4 mt-10" : "items-center"}`}>
          {isOpen && (
            <div className="flex items-center mt-1 mb-18">
              <img src={Logo} alt="Murai-Logo" className="h-10" />
              <button
                className="ml-auto p-2 rounded-full hover:bg-gray-100 transition"
                onClick={() => setIsOpen(false)}
                aria-label="Close sidebar"
              >
                <FiChevronLeft size={22} />
              </button>
            </div>
          )}
          <nav className={`flex flex-col gap-2 ${isOpen ? "" : "items-center"}`}>
            {menu.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center ${isOpen ? "gap-4 px-2 py-2 rounded-xl w-full" : "justify-center p-2 rounded-lg w-10 h-10"} transition-all
                    ${isActive ? "bg-gray-100 text-black" : "text-[#787878] hover:bg-gray-50 hover:text-black"}`}
                  style={{ fontSize: '16px', fontWeight: '200' }}
                  aria-label={item.label}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {isOpen && <span className="pl-1" style={{ fontSize: '16px', fontWeight: '200' }}>{item.label}</span>}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Bottom: Upgrade/User/Logout or Account Menu */}
      <div className={`flex flex-col gap-3 mb-4 ${isOpen ? "px-4" : "items-center"} relative`}>
        {isOpen ? (
          <>
            {/* Upgrade Card */}
            <div className="px-3 py-4 rounded-xl bg-gradient-to-b from-gray-100 to-white text-center flex flex-col items-center">
              <span className="font-semibold text-sm mb-1">Update to Pro</span>
              <span className="text-xs text-gray-500 mb-3">Get 1 month free<br/>and unlock</span>
              <button className="bg-black text-white rounded-full px-6 py-2 text-sm font-semibold">Upgrade</button>
            </div>
            {/* User Box (clickable, horizontal row) */}
            <button
              className="flex items-center justify-between bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl px-4 py-3 text-[#787878] text-sm font-medium shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition group"
              onClick={() => setShowAccountMenu((prev) => !prev)}
              aria-label="Account menu"
              type="button"
              tabIndex={0}
            >
              <span>{user?.name || user?.email || 'User'}</span>
              {showAccountMenu ? (
                <FiChevronUp className="text-xl ml-2" />
              ) : (
                <FiChevronDown className="text-xl ml-2" />
              )}
            </button>
            {showAccountMenu && AccountMenu}
          </>
        ) : (
          <>
            {/* Logout Icon (clickable) */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition text-[#787878]"
              aria-label="Account menu"
              onClick={() => setShowAccountMenu((prev) => !prev)}
              type="button"
            >
              <FiLogOut size={22} />
            </button>
            {showAccountMenu && (
              <div ref={accountMenuRef} className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 w-48 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col py-2 animate-fade-in">
                <button className="flex items-center gap-2 px-4 py-2 text-[#787878] hover:bg-gray-50 hover:text-black transition text-sm" onClick={() => setShowAccountMenu(false)}>
                  <FiSettings /> <span>Settings</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-[#787878] hover:bg-gray-50 hover:text-black transition text-sm" onClick={handleLogout}>
                  <FiLogOut /> <span>Logout</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}