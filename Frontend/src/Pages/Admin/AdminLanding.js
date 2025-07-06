import React from "react";
import Navbar from '../Navbar/Navbar';
import { useNavigate } from 'react-router-dom'

export default function AdminLanding(){
    const navigate = useNavigate();
    const handleClick1 = (e) => {
        navigate('/studentData');
    }
    const handleClick2 = (e) => {
        navigate('/resources');
    }
    const handleClick3 = (e) => {
        navigate('/braille-analytics');
    }
    return (
        <div>
            <Navbar />
            <div className='flex flex-col gap-8 pb-11 justify-center items-center min-h-screen'>
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className='flex flex-row gap-8'>
                    <button onClick={handleClick1} className={`border-[1px] border-black px-4 py-2 rounded hover:bg-gray-100 transition duration-300`}>Student Data</button>
                    <button onClick={handleClick2} className={`border-[1px] border-black px-4 py-2 rounded hover:bg-gray-100 transition duration-300`}>Resources</button>
                    <button onClick={handleClick3} className={`border-[1px] border-black px-4 py-2 rounded hover:bg-gray-100 transition duration-300`}>Braille Analytics</button>
                </div>
            </div>
        </div>
    )
};