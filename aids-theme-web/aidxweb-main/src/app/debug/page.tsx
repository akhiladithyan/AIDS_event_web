"use client";

import React, { useEffect, useState } from 'react';
import config from '@/config';

export default function DebugPage() {
    const [envVar, setEnvVar] = useState<string>('');
    const [configUrl, setConfigUrl] = useState<string>('');

    useEffect(() => {
        // These are evaluated at build time in Next.js for client components
        setEnvVar(process.env.NEXT_PUBLIC_API_URL || 'undefined');
        setConfigUrl(config.API_URL);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-10 font-mono">
            <h1 className="text-2xl font-bold mb-6 text-red-500">DEBUG PAGE</h1>

            <div className="space-y-4">
                <div className="border border-gray-700 p-4 rounded">
                    <p className="text-gray-400 text-sm">process.env.NEXT_PUBLIC_API_URL</p>
                    <p className="text-xl text-green-400 break-all">{envVar}</p>
                </div>

                <div className="border border-gray-700 p-4 rounded">
                    <p className="text-gray-400 text-sm">config.API_URL</p>
                    <p className="text-xl text-blue-400 break-all">{configUrl}</p>
                </div>

                <div className="mt-8">
                    <p className="text-sm text-gray-400 mb-2">Test Connectivity:</p>
                    <button
                        onClick={() => {
                            fetch(`${config.API_URL}/events`)
                                .then(res => res.json())
                                .then(data => alert(`Success! Found ${data.length} events`))
                                .catch(err => alert(`Error: ${err.message}`));
                        }}
                        className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
                    >
                        Test /api/events
                    </button>
                </div>
            </div>
        </div>
    );
}
