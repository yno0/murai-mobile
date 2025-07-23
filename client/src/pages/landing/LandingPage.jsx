import * as React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.svg";
import hero from "../../assets/hero-img.png";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const navItems = [
    { name: "About", path: "/about" },
    { name: "Features", path: "/features" },
    { name: "How it works", path: "/how-it-works" },
    { name: "Pricing", path: "/pricing" },
  ];

  return (
    <div>
      <header>
        <nav className="flex justify-between items-center p-4 bg ml-6 mr-5">
          <div className="flex">
            <img src={Logo} alt="Logo" />
          </div>
          <div className="flex-auto w-2">
            <ul className="flex justify-center items-center gap-20">
              {navItems.map((item, index) => (
                <li key={index}>
                  <button onClick={() => navigate(item.path)}>
                    <p className="text-sm">{item.name}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center">
            <div className="flex gap-2">
              <button
                className=" text-black text-sm px-4 py-2 rounded"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="bg-black pl-6  text-sm pr-6 text-white px-4 py-2 rounded-full"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>
        <hr className="border-t border-gray-200" />
      </header>

      <section className="block p-10 mx-2 my-4">
        <div className="flex items-center justify-center">
          <div className="flex-1">
            <p className="text-8xl">Browse with care</p>
          </div>
          <div className="flex items-right">
            <p className="w-lg items-right text-right text-md mt-7">
              A smart browser extension that moderates inappropriate words in
              Filipino and English using real-time sentiment analysis.
            </p>
          </div>
        </div>
        <div className="flex item-center justify-center">
          <div className="flex-1">
            <p className="text-8xl">Just one click away</p>
          </div>
          <div className="align-center justify-center mt-7">
            <button className="bg-black text-white  pt-3 pb-3 px-3 rounded-full">
              Download Extension
            </button>
            <button className="text-black border border-black pt-3 pb-4 px-4 rounded-full mx-2">
              Watch Demo
            </button>
          </div>
        </div>
      </section>
      <div className="relative w-full flex justify-center items-center mb-0 pb-0">
        <img src={hero} alt="" className="relative z-10 h-[500px]" />
        <div className="absolute top-0 left-0 w-full h-[300px] rounded-t-[210px] bg-gradient-to-b from-white to-gray-300 z-0">
          {" "}
        </div>
        <div className="absolute top-20 left-0 w-[100%] h-[300px] rounded-t-[210px] bg-gradient-to-b from-white to-gray-300 mx-auto right-0 z-0"></div>
        <div className="absolute top-40 left-0 w-[100%] h-[400px] rounded-t-[210px] bg-black right-0 z-0"></div>
      </div>


      <section className="flex justify-center bg-black h-400 mb-0 p-20 mx">
        <div className="text-white w-full mx-4">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center">
              <p className="text-6xl font-regular text-gray-400">/</p>
              <p className="text-6xl font-regular ml-2">Features</p>
              <div className="w-104 h-0.5 bg-gray-300 mx-6"></div>
              <p className="text-6xl font-light">Built for Kinder Web</p>
            </div>
          </div>
          <div className="flex  justify-between">
            <div className="flex ">
              <button className="text-4xl ">
                <CircleChevronLeft size={100} strokeWidth={0.5} />
              </button>
              <button className="text-4xl  ml-10">
                <CircleChevronRight size={100} strokeWidth={0.5} />
              </button>
            </div>
            <div className="w-md text-right">
              <p>
                Smart, bilingual, and built for everyone who wants a safer
                browsing experience
              </p>
            </div>
          </div>
          <div>
            <div>

            </div>
            <div>

            </div>
            <div>
                
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
