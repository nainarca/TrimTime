import { ServicesService } from './services.service';
import { ServiceInput } from './dto/service.input';
import { AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';
export declare class ServicesResolver {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    publicServices(shopId: string): Promise<{
        name: string;
        id: string;
        shopId: string;
        description: string;
        durationMins: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        isActive: boolean;
        displayOrder: number;
        createdAt: Date;
    }[]>;
    services(shopId: string, user: AuthenticatedUser): Promise<{
        name: string;
        id: string;
        shopId: string;
        description: string;
        durationMins: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        isActive: boolean;
        displayOrder: number;
        createdAt: Date;
    }[]>;
    upsertService(input: ServiceInput, user: AuthenticatedUser): Promise<{
        name: string;
        id: string;
        shopId: string;
        description: string;
        durationMins: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        isActive: boolean;
        displayOrder: number;
        createdAt: Date;
    }>;
    deleteService(id: string, user: AuthenticatedUser): Promise<boolean>;
}
