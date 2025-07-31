// src/families/families.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { FamilyResponseDto } from './dto/family-response.dto';
import { FamiliesService } from './familes.service';


@ApiTags('families')
@Controller('families')
// @UseGuards(JwtAuthGuard) // Uncomment if you have authentication
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService ) {}


@Post()
async create(@Body() createFamilyDto: any): Promise<any> {
    return this.familiesService.create(createFamilyDto);
}

  @Get()
  @ApiOperation({ summary: 'Get all families' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all families',
    type: [FamilyResponseDto] 
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findAll(): Promise<FamilyResponseDto[]> {
    return this.familiesService.findAll();
  }

  @Get('debug/parents')
  @ApiOperation({ summary: 'Debug: Get all available parents' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all parents for debugging'
  })
  async getAvailableParents() {
    return this.familiesService.getAvailableParents();
  }
  @ApiOperation({ summary: 'Get families by parent ID' })
  @ApiParam({ name: 'parentId', description: 'Parent ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of families for the specified parent',
    type: [FamilyResponseDto] 
  })
  @ApiResponse({ status: 400, description: 'Invalid parent ID' })
  async findFamiliesByParent(@Param('parentId') parentId: string): Promise<FamilyResponseDto[]> {
    return this.familiesService.findFamiliesByParent(parentId);
  }

  @Get('by-child/:childId')
  @ApiOperation({ summary: 'Get families by child ID' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of families for the specified child',
    type: [FamilyResponseDto] 
  })
  @ApiResponse({ status: 400, description: 'Invalid child ID' })
  async findFamiliesByChild(@Param('childId') childId: string): Promise<FamilyResponseDto[]> {
    return this.familiesService.findFamiliesByChild(childId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get family by ID' })
  @ApiParam({ name: 'id', description: 'Family ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Family details',
    type: FamilyResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid family ID' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async findOne(@Param('id') id: string): Promise<FamilyResponseDto> {
    return this.familiesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFamilyDto,
  ): Promise<any> {

    console.log('Update Family DTO:', updateFamilyDto);
    return this.familiesService.update(id, updateFamilyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete family by ID' })
  @ApiParam({ name: 'id', description: 'Family ID' })
  @ApiResponse({ status: 204, description: 'Family has been successfully deleted' })
  @ApiResponse({ status: 400, description: 'Invalid family ID' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.familiesService.remove(id);
  }
}