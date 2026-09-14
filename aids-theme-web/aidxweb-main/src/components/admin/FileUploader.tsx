import React, { useState } from 'react';
import { FaCloudUploadAlt, FaTimes, FaFilePdf, FaSpinner } from 'react-icons/fa';
import config from '../../config';
import { safeJsonResponse } from '@/lib/utils';
import { MediaAsset } from '../../types/admin';

interface FileUploaderProps {
    onUpload: (asset: MediaAsset | null) => void;
    initialUrl?: string | MediaAsset | null;
    type?: 'image' | 'video' | 'pdf';
    label?: string;
    folder?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
    onUpload,
    initialUrl,
    type = 'image',
    label = 'Upload File',
    folder = 'uploads'
}) => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Helper to extract URL string from initialUrl prop
    const getUrl = (urlOrObj: string | MediaAsset | null | undefined): string | null => {
        if (!urlOrObj) return null;
        return typeof urlOrObj === 'string' ? urlOrObj : urlOrObj.url;
    };

    const initialUrlString = getUrl(initialUrl);

    const getInitialPreviewType = (url: string | null): 'image' | 'video' | 'pdf' => {
        if (!url) return 'image';
        if (url.match(/\.(mp4|webm|ogg)$/i)) return 'video';
        if (url.match(/\.(pdf)$/i)) return 'pdf';
        return 'image';
    };

    const initialType = getInitialPreviewType(initialUrlString);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const res = await fetch(`${config.API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const json = await safeJsonResponse(res);

            if (json && json.success) {
                const resultData = json.data || { url: json.url, publicId: null, type: file.type };

                const mediaAsset: MediaAsset = {
                    url: resultData.url,
                    publicId: resultData.publicId,
                    type: file.type.startsWith('video/') ? 'video' : file.type === 'application/pdf' ? 'pdf' : 'image'
                };

                setPreview(resultData.url);
                onUpload(mediaAsset);
            } else {
                setError(json?.error || 'Upload failed');
            }
        } catch (err) {
            console.error(err);
            setError('Upload request failed');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onUpload(null);
    };

    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [libraryImages, setLibraryImages] = useState<any[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    const fetchLibraryImages = async () => {
        setIsLoadingLibrary(true);
        try {
            const res = await fetch(`${config.API_URL}/admin/cloudinary`);
            const data = await safeJsonResponse(res);
            if (data && data.success) {
                setLibraryImages(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch library", error);
        }
        setIsLoadingLibrary(false);
    };

    const openLibrary = () => {
        setIsLibraryOpen(true);
        fetchLibraryImages();
    };

    const handleSelectFromLibrary = (img: any) => {
        const mediaAsset: MediaAsset = {
            url: img.secure_url,
            publicId: img.public_id,
            type: img.format === 'pdf' ? 'pdf' : (img.resource_type === 'video' ? 'video' : 'image')
        };
        setPreview(img.secure_url);
        onUpload(mediaAsset);
        setIsLibraryOpen(false);
    };

    const currentUrl = preview || initialUrlString;
    const currentType = preview
        ? (preview.match(/\.(mp4|webm|ogg)$/i) ? 'video' : preview.match(/\.(pdf)$/i) ? 'pdf' : 'image')
        : initialType;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                    {label}
                </label>
                <button
                    type="button"
                    onClick={openLibrary}
                    className="text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                >
                    <FaCloudUploadAlt /> Select Existing
                </button>
            </div>

            <div className="relative group">
                {!currentUrl ? (
                    <label className={`
            flex flex-col items-center justify-center w-full h-32 
            border-2 border-dashed border-white/10 rounded-xl 
            cursor-pointer bg-[#222] hover:bg-[#2a2a2a] 
            hover:border-purple-500/50 transition-all
            ${loading ? 'opacity-50 pointer-events-none' : ''}
          `}>
                        {loading ? (
                            <FaSpinner className="w-8 h-8 text-purple-500 animate-spin" />
                        ) : (
                            <>
                                <FaCloudUploadAlt className="w-8 h-8 text-gray-500 group-hover:text-purple-400 mb-2 transition-colors" />
                                <span className="text-xs text-gray-400">Click to upload or select existing</span>
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept={type === 'video' ? "video/*" : type === 'pdf' ? "application/pdf" : "image/*,video/*,application/pdf"}
                        />
                    </label>
                ) : (
                    <div className="relative w-full h-48 bg-[#111] rounded-xl overflow-hidden border border-white/10 group">
                        {currentType === 'video' ? (
                            <video src={currentUrl} className="w-full h-full object-contain" controls />
                        ) : currentType === 'pdf' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <FaFilePdf size={48} className="text-red-400" />
                                <span className="text-xs">PDF Document</span>
                                <a href={currentUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline text-xs">View</a>
                            </div>
                        ) : (
                            <img src={currentUrl} alt="Preview" className="w-full h-full object-contain" />
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <label className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer text-white transition-colors" title="Replace">
                                <FaCloudUploadAlt size={18} />
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept={type === 'video' ? "video/*" : type === 'pdf' ? "application/pdf" : "image/*,video/*,application/pdf"}
                                />
                            </label>
                            <button
                                onClick={openLibrary}
                                className="p-2 bg-purple-600/80 hover:bg-purple-600 rounded-full text-white transition-colors"
                                title="Select from Library"
                                type="button"
                            >
                                <FaCloudUploadAlt size={18} />
                            </button>
                            <button
                                onClick={clearFile}
                                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                                title="Remove"
                                type="button"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {loading && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                                <FaSpinner className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        )}
                    </div>
                )}

                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            {/* LIBRARY MODAL */}
            {isLibraryOpen && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-[#151515] border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white">Select from Library</h3>
                            <button onClick={() => setIsLibraryOpen(false)} className="text-gray-400 hover:text-white">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {isLoadingLibrary ? (
                                <div className="flex justify-center items-center h-full">
                                    <FaSpinner className="w-8 h-8 text-purple-500 animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {libraryImages.map((img) => (
                                        <button
                                            key={img.public_id}
                                            onClick={() => handleSelectFromLibrary(img)}
                                            className="relative aspect-square bg-black rounded-lg overflow-hidden border border-white/10 hover:border-purple-500 hover:scale-105 transition-all group"
                                        >
                                            <img src={img.secure_url} alt={img.public_id} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-xs text-white bg-purple-600 px-2 py-1 rounded">Select</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
