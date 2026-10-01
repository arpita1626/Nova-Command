import { workforceRepository } from '../repositories/workforce.repository';

export class WorkforceService {
  async getAllEmployees() {
    const list = await workforceRepository.getAllEmployees();
    return list.map((emp: any) => ({
      ...emp,
      skills: typeof emp.skills === 'string' ? JSON.parse(emp.skills) : emp.skills,
    }));
  }

  async getEmployeeById(id: string) {
    const emp = await workforceRepository.getEmployeeById(id);
    if (!emp) {
      throw new Error(`Employee ${id} not found`);
    }
    return {
      ...emp,
      skills: JSON.parse(emp.skills),
    };
  }

  async getAllUsers() {
    return workforceRepository.getAllUsers();
  }

  async createUser(data: {
    id: string;
    name: string;
    email: string;
    role: string;
    title: string;
    initials: string;
    department: string;
    avatarBg: string;
    description: string;
  }) {
    return workforceRepository.createUser(data);
  }

  async updateUserRole(id: string, role: string) {
    return workforceRepository.updateUserRole(id, role);
  }
}

export const workforceService = new WorkforceService();
