import { BarbersService } from './barbers.service';
import { BarberInput } from './dto/barber.input';
import { AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';
export declare class BarbersResolver {
    private readonly barbersService;
    constructor(barbersService: BarbersService);
    publicBarbers(shopId: string): Promise<{
        id: string;
        userId: string;
        shopId: string;
        branchId: string;
        displayName: string;
        bio: string;
        avatarUrl: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    barbers(shopId: string, user: AuthenticatedUser): Promise<{
        id: string;
        userId: string;
        shopId: string;
        branchId: string;
        displayName: string;
        bio: string;
        avatarUrl: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    upsertBarber(input: BarberInput, user: AuthenticatedUser): Promise<{
        id: string;
        userId: string;
        shopId: string;
        branchId: string;
        displayName: string;
        bio: string;
        avatarUrl: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteBarber(id: string, user: AuthenticatedUser): Promise<boolean>;
}
