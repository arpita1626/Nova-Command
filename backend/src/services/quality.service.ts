import { qualityRepository } from '../repositories/quality.repository';
import { consequenceEngineService } from './consequence.service';
import { CreateQualityInspectionInput } from '../types';

export class QualityService {
  async getAllInspections() {
    return qualityRepository.getAll();
  }

  async getInspectionById(id: string) {
    const qi = await qualityRepository.getById(id);
    if (!qi) {
      throw new Error(`Quality inspection ${id} not found`);
    }
    return qi;
  }

  async createInspection(input: CreateQualityInspectionInput) {
    const created = await qualityRepository.createInspection(input);
    await consequenceEngineService.propagate();
    return created;
  }

  async getAllCorrectiveActions() {
    return qualityRepository.getAllCorrectiveActions();
  }

  async createCorrectiveAction(data: any) {
    return qualityRepository.createCorrectiveAction(data);
  }

  async updateCorrectiveActionStatus(id: string, status: string) {
    return qualityRepository.updateCorrectiveActionStatus(id, status);
  }
}

export const qualityService = new QualityService();
