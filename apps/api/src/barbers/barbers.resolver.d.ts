import { BarbersService } from './barbers.service';
import { BarberInput } from './dto/barber.input';
import { AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';
export declare class BarbersResolver {
    private readonly barbersService;
    constructor(barbersService: BarbersService);
    barbers(shopId: string, user: AuthenticatedUser): Promise<{
        id: string;
        shopId: string;
        branchId: string;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string;
        isActive: boolean;
        userId: string;
        displayName: string;
        bio: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
    }[]>;
    upsertBarber(input: BarberInput, user: AuthenticatedUser): Promise<{
        id: string;
        shopId: string;
        branchId: string;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string;
        isActive: boolean;
        userId: string;
        displayName: string;
        bio: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
    }>;
    deleteBarber(id: string, user: AuthenticatedUser): Promise<boolean>;
}
