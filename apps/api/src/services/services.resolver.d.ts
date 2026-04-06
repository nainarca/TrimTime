import { ServicesService } from './services.service';
import { ServiceInput } from './dto/service.input';
import { AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';
export declare class ServicesResolver {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    services(shopId: string, user: AuthenticatedUser): Promise<{
        name: string;
        id: string;
        shopId: string;
        durationMins: number;
        createdAt: Date;
        isActive: boolean;
        description: string;
        currency: string;
        price: import("@prisma/client/runtime/library").Decimal;
        displayOrder: number;
    }[]>;
    upsertService(input: ServiceInput, user: AuthenticatedUser): Promise<{
        name: string;
        id: string;
        shopId: string;
        durationMins: number;
        createdAt: Date;
        isActive: boolean;
        description: string;
        currency: string;
        price: import("@prisma/client/runtime/library").Decimal;
        displayOrder: number;
    }>;
    deleteService(id: string, user: AuthenticatedUser): Promise<boolean>;
}
