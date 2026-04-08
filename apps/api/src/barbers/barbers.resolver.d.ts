import { BarbersService } from './barbers.service';
import { BarberInput } from './dto/barber.input';
import { AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';
export declare class BarbersResolver {
    private readonly barbersService;
    constructor(barbersService: BarbersService);
    publicBarbers(shopId: string): Promise<{
        id: string;
        shopId: string;
        isActive: boolean;
        createdAt: Date;
        avatarUrl: string;
        updatedAt: Date;
        userId: string;
        branchId: string;
        displayName: string;
        bio: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
    }[]>;
    barbers(shopId: string, user: AuthenticatedUser): Promise<{
        id: string;
        shopId: string;
        isActive: boolean;
        createdAt: Date;
        avatarUrl: string;
        updatedAt: Date;
        userId: string;
        branchId: string;
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
        isActive: boolean;
        createdAt: Date;
        avatarUrl: string;
        updatedAt: Date;
        userId: string;
        branchId: string;
        displayName: string;
        bio: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
    }>;
    deleteBarber(id: string, user: AuthenticatedUser): Promise<boolean>;
}
