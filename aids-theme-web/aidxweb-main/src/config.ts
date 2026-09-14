const getApiUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    // Ensure URL ends with /api to avoid 404s if user forgets it
    if (url.endsWith('/api')) return url;
    return `${url}/api`;
};

const config = {
    API_URL: getApiUrl(),
};

export default config;
