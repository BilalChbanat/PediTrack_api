// family-response.dto.ts
export class FamilyResponseDto {
    readonly _id: string;
    readonly familyName: string;
    readonly parentId: string;
    readonly children: string[];
    readonly parent?: {
        _id: string;
        fullName: string;
        phoneNumber: string;
        email: string;
    };
    readonly childrenDetails?: Array<{
        _id: string;
        firstName: string;
        lastName: string;
        birthDate: Date;
        gender: string;
    }>;
    readonly totalMembers: number;
}