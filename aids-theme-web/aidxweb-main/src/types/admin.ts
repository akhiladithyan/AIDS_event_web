export interface MediaAsset {
    url: string;
    publicId?: string;
    type: 'image' | 'video' | 'pdf';
}

export interface TicketPrices {
    diamond: number;
    gold: number;
    silver: number;
    [key: string]: number;
}

export interface Content {
    heroTitle: string;
    heroSubtitle: string;
    heroBackgroundMedia: MediaAsset | null;
    marqueeText: string;
    eventDate: string;
    ticketPrices: TicketPrices;
    upiId: string;
    qrCodeUrl: string;
    galleryImages: MediaAsset[];
    faqs: { question: string; answer: string }[];
    isTicketPassEnabled?: boolean;
    isPaymentEnabled?: boolean;
}

export interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    description: string;
    category: string;
    registeredCount: number;
    maxSlots: number;
    image: MediaAsset | null;
    participationType: 'Solo' | 'Team';
    teamSize?: string;
    coordinatorPhone?: string; // Event coordinator contact number
    // Ticket-based pricing
    isPassEvent?: boolean; // New toggle
    isFree?: boolean;      // New toggle for Free events
    isRegistrationClosed?: boolean; // New per-event toggle
    ticketTiers: string[];
    // Manual pricing
    entryFee?: number; // New field for non-pass events

    importantNote?: string; // New field for important event info
    rules: string[];
}

export interface TeamMember {
    _id?: string;
    id?: string;
    name: string;
    role: string;
    category: string;
    image: MediaAsset | null;
    isActive: boolean;
    instagram?: string;
    linkedin?: string;
    order: number;
}

export interface Registration {
    _id: string;
    name: string;
    email: string;
    phone: string;
    college: string;
    degree: string;
    course: string;
    year: string;
    isVeltechStudent: boolean;
    vmNumber?: string;
    idCardUrl?: string;
    paymentScreenshotUrl: string;
    eventOfInterest?: string; // Legacy
    eventId?: string;        // New
    eventName?: string;      // New
    teamName?: string;       // New (for Team events)
    members?: any[];     // New (for Team events)
    teamLeader?: any;    // New (for Team events)
    participationType?: 'Solo' | 'Team'; // New
    paymentStatus: string;
    isActive?: boolean;      // Verified status
    createdAt: string;
}
