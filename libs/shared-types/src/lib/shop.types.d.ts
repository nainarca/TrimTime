export interface Shop {
    id: string;
    ownerId: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    phone: string;
    email?: string;
    country: string;
    timezone: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ShopBranch {
    id: string;
    shopId: string;
    name: string;
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    isActive: boolean;
    isMain: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface OperatingHour {
    id: string;
    branchId: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}
export interface CreateShopInput {
    name: string;
    slug: string;
    phone: string;
    country: string;
    timezone: string;
    email?: string;
    description?: string;
}
export interface UpdateShopInput extends Partial<CreateShopInput> {
    isActive?: boolean;
}
