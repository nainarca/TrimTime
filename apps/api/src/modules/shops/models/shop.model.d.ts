export declare class ShopModel {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    country: string;
    timezone: string;
    currency: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
}
export declare class BranchModel {
    id: string;
    shopId: string;
    name: string;
    address: string | null;
    city: string | null;
    lat: number | null;
    lng: number | null;
    isMain: boolean;
    isActive: boolean;
}
