// src/common/interfaces/menu-item/menu-item-crud.interface.ts
import { HttpStatus } from '@nestjs/common';
import { IMenuItem } from './menu-item.interface';

export interface MenuItemResponse {
    status: HttpStatus;
    data: {
        message?: string;
        error?: string;
        result?: IMenuItem; // Use IMenuItem instead of MenuItem
    };
}

export interface MenuItemsResponse {
    status: HttpStatus;
    data: {
        message?: string;
        error?: string;
        result?: IMenuItem[]; // Use IMenuItem[] instead of MenuItem[]
        count?: number;
    };
}

export interface DeleteMenuItemResponse {
    status: HttpStatus;
    data: {
        message?: string;
        error?: string;
        deleted: boolean;
    };
}