import { ServicesService } from './services.service';
import { ServiceInput } from './dto/service.input';
import { AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';
export declare class ServicesResolver {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    services(shopId: string, user: AuthenticatedUser): Promise<{
        name: string;
        description: string;
        shopId: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        durationMins: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        displayOrder: number;
    }[]>;
    upsertService(input: ServiceInput, user: AuthenticatedUser): Promise<{
        name: string;
        description: string;
        shopId: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        durationMins: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        displayOrder: number;
    }>;
    deleteService(id: string, user: AuthenticatedUser): Promise<boolean>;
}
