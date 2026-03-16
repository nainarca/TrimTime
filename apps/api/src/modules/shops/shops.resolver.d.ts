import { ShopsService } from './shops.service';
import { ShopModel, BranchModel } from './models/shop.model';
import { CreateShopInput, UpdateShopInput } from './dto/create-shop.input';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
export declare class ShopsResolver {
    private readonly shopsService;
    constructor(shopsService: ShopsService);
    shopBySlug(slug: string): Promise<ShopModel>;
    shopBranchesBySlug(slug: string): Promise<BranchModel[]>;
    myShop(user: AuthenticatedUser): Promise<ShopModel | null>;
    shopBranches(shopId: string, user: AuthenticatedUser): Promise<BranchModel[]>;
    createShop(user: AuthenticatedUser, input: CreateShopInput): Promise<ShopModel>;
    updateShop(user: AuthenticatedUser, shopId: string, input: UpdateShopInput): Promise<ShopModel>;
}
