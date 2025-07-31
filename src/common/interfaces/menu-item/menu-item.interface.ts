export interface IMenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    category: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}