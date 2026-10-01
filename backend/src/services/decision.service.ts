import { decisionRepository } from '../repositories/decision.repository';

export class DecisionService {
  async getAllRecommendations() {
    const list = await decisionRepository.getAll();
    return list.map((item: any) => ({
      ...item,
      actionPayload: item.actionPayloadJson ? JSON.parse(item.actionPayloadJson) : undefined,
    }));
  }

  async getRecommendationById(id: string) {
    const item = await decisionRepository.getById(id);
    if (!item) {
      throw new Error(`Recommendation ${id} not found`);
    }
    return {
      ...item,
      actionPayload: item.actionPayloadJson ? JSON.parse(item.actionPayloadJson) : undefined,
    };
  }

  async updateStatus(id: string, status: string) {
    return decisionRepository.updateStatus(id, status);
  }
}

export const decisionService = new DecisionService();
