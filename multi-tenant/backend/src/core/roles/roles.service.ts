import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly prismaTenancy: PrismaTenancyService) {}

  async findAll() {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.role.findMany({
      include: { rolePermissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    const role = await client.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }

  async create(dto: CreateRoleDto) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        isCustom: dto.isCustom ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (role.isSystem) throw new ForbiddenException('System roles cannot be modified');
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.role.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) throw new ForbiddenException('System roles cannot be deleted');
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.role.delete({ where: { id } });
  }

  async assignRoleToUser(dto: AssignRoleDto) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.userRole.upsert({
      where: { userId_roleId: { userId: dto.userId, roleId: dto.roleId } },
      create: { userId: dto.userId, roleId: dto.roleId },
      update: {},
    });
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async assignPermissionToRole(dto: AssignPermissionDto) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: dto.roleId, permissionId: dto.permissionId },
      },
      create: { roleId: dto.roleId, permissionId: dto.permissionId },
      update: {},
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }

  async listPermissions() {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.permission.findMany({ orderBy: { resource: 'asc' } });
  }
}
