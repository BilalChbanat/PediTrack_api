// src/families/families.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Family, FamilyDocument } from './schemas/family.schema';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { FamilyResponseDto } from './dto/family-response.dto';
import { User } from '../auth/schema/user.schema';
import { Patient } from '../patient/patient.schema';

@Injectable()
export class FamiliesService {
    constructor(
        @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
        @InjectModel('User') private parentModel: Model<User>,
        @InjectModel('Patient') private patientModel: Model<Patient >,
    ) {}

   async create(createFamilyDto): Promise<any> {
    try {
        // Validation for single parent
        if (!createFamilyDto.parentId || !Array.isArray(createFamilyDto.parentId)) {
            throw new BadRequestException('Parent ID must be provided as an array');
        }

        // Take the first parent ID (frontend only allows one)
        const primaryParentId = createFamilyDto.parentId[0];
        
        await this.validateParentId(primaryParentId);
        
        const createdFamily = new this.familyModel({
            ...createFamilyDto,
            parentId: new Types.ObjectId(primaryParentId), // Store as single ObjectId
            children: createFamilyDto.children?.map(id => new Types.ObjectId(id)) || [],
        });


            const savedFamily = await createdFamily.save();
            return this.populateFamilyData(savedFamily);
        } catch (error) {
            if (error instanceof ConflictException || error instanceof BadRequestException) throw error;
            throw new BadRequestException('Failed to create family');
        }
    }

    async findAll(): Promise<FamilyResponseDto[]> {
        try {
            const families = await this.familyModel.find().sort({ familyName: 1 }).populate('parentId', 'fullName phoneNumber email');
            return Promise.all(families.map(family => this.populateFamilyData(family)));
        } catch {
            throw new BadRequestException('Failed to fetch families');
        }
    }

    async findOne(id: string): Promise<FamilyResponseDto> {
        try {
            if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid family ID format');
            const family = await this.familyModel.findById(id);
            if (!family) throw new NotFoundException(`Family with ID ${id} not found`);
            return this.populateFamilyData(family);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new BadRequestException('Failed to fetch family');
        }
    }

    async update(id: string, updateFamilyDto: { familyName?: string; parentId?: string[]; children?: string[] }): Promise<any> {
        try {
            if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid family ID format');
            const existingFamily = await this.familyModel.findById(id);
            if (!existingFamily) throw new NotFoundException(`Family with ID ${id} not found`);

            // Check for family name conflict
            if (
                updateFamilyDto.familyName &&
                updateFamilyDto.familyName !== existingFamily.familyName
            ) {
                const conflictingFamily = await this.familyModel.findOne({
                    familyName: { $regex: new RegExp(`^${updateFamilyDto.familyName}$`, 'i') },
                    _id: { $ne: id }
                });
                if (conflictingFamily) throw new ConflictException('A family with this name already exists');
            }

            // Validate parentId (expects array with one element)
            let parentId: string | undefined;
            if (updateFamilyDto.parentId && Array.isArray(updateFamilyDto.parentId) && updateFamilyDto.parentId.length > 0) {
                parentId = updateFamilyDto.parentId[0];
                await this.validateParentId(parentId);
            }

            // Validate children
            if (updateFamilyDto.children) {
                await this.validateChildrenIds(updateFamilyDto.children);
            }

            // Prepare update data
            const updateData: any = {};
            if (updateFamilyDto.familyName) updateData.familyName = updateFamilyDto.familyName;
            if (parentId) updateData.parentId = new Types.ObjectId(parentId);
            if (updateFamilyDto.children) updateData.children = updateFamilyDto.children.map(id => new Types.ObjectId(id));

            const updatedFamily = await this.familyModel.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            return this.populateFamilyData(updatedFamily);
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) throw error;
            throw new BadRequestException('Failed to update family');
        }
    }

    async remove(id: string): Promise<void> {
        try {
            if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid family ID format');
            const result = await this.familyModel.findByIdAndDelete(id);
            if (!result) throw new NotFoundException(`Family with ID ${id} not found`);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new BadRequestException('Failed to delete family');
        }
    }

    async getAvailableParents() {
        try {
            const parents = await this.parentModel.find({}, '_id fullName phoneNumber email');
            return parents.map(parent => ({
                _id: parent._id.toString(),
                fullName: parent.fullName,
                phoneNumber: parent.phoneNumber,
                email: parent.email
            }));
        } catch {
            throw new BadRequestException('Failed to fetch available parents');
        }
    }

    async findFamiliesByParent(parentId: string): Promise<FamilyResponseDto[]> {
        try {
            if (!Types.ObjectId.isValid(parentId)) throw new BadRequestException('Invalid parent ID format');
            const families = await this.familyModel.find({ parentId: new Types.ObjectId(parentId) });
            return Promise.all(families.map(family => this.populateFamilyData(family)));
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new BadRequestException('Failed to fetch families by parent');
        }
    }

    async findFamiliesByChild(childId: string): Promise<FamilyResponseDto[]> {
        try {
            if (!Types.ObjectId.isValid(childId)) throw new BadRequestException('Invalid child ID format');
            const families = await this.familyModel.find({ children: new Types.ObjectId(childId) });
            return Promise.all(families.map(family => this.populateFamilyData(family)));
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new BadRequestException('Failed to fetch families by child');
        }
    }

   private async validateParentId(parentId: string): Promise<void> {
    if (!Types.ObjectId.isValid(parentId)) {
        throw new BadRequestException('Parent ID is invalid');

    }
    console.log('Validating parent ID:', parentId);
    const existingParent = await this.parentModel.findById(parentId);
    if (!existingParent) {
        throw new BadRequestException('Parent ID does not exist');
    }
}

    private async validateChildrenIds(childrenIds: string[]): Promise<void> {
        const validChildrenIds = childrenIds.filter(id => Types.ObjectId.isValid(id));
        if (validChildrenIds.length !== childrenIds.length) throw new BadRequestException('One or more children IDs are invalid');
        const existingChildren = await this.patientModel.find({
            _id: { $in: validChildrenIds.map(id => new Types.ObjectId(id)) }
        });
        if (existingChildren.length !== childrenIds.length) throw new BadRequestException('One or more children IDs do not exist');
    }

    private async populateFamilyData(family: FamilyDocument): Promise<any> {
    const [parent, children] = await Promise.all([
        this.parentModel.findById(family.parentId), // Now single ID
        this.patientModel.find({ _id: { $in: family.children } })
    ]);
    
    return {
        _id: family._id.toString(),
        familyName: family.familyName,
        parentId: family.parentId.toString(), // Single ID
        children: family.children.map(id => id.toString()),
        parent: parent ? {
            _id: parent._id.toString(),
            fullName: parent.fullName,
            phoneNumber: parent.phoneNumber,
            email: parent.email,
        } : null,
        childrenDetails: children.map(child => ({
            _id: child._id.toString(),
            firstName: child.firstName,
            lastName: child.lastName,
            birthDate: child.birthDate,
            gender: child.gender,
        })),
        totalMembers: 1 + (family.children?.length || 0),
    };
}
}
