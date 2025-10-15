import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { OwnerApplication, ApplicationStatus } from '../models/OwnerApplication';

export class OwnerApplicationController {
  static async submit(req: Request, res: Response) {
    try {
      const { fullName, email, phone, propertyName, city, region, propertyType, unitsAvailable, message } = req.body;
      if (!fullName || !email || !propertyName || !city || !region) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      const repo = AppDataSource.getRepository(OwnerApplication);
      const app = repo.create({
        fullName,
        email: String(email).toLowerCase(),
        phone: phone || null,
        propertyName,
        city,
        region,
        propertyType: propertyType || null,
        unitsAvailable: unitsAvailable !== undefined && unitsAvailable !== null ? Number(unitsAvailable) : null,
        message: message || null,
        status: ApplicationStatus.PENDING,
      });
      const saved = await repo.save(app);
      return res.status(201).json({ success: true, message: 'Application submitted', data: saved });
    } catch (error) {
      console.error('[OWNER APPLICATION] Submit error:', error);
      return res.status(500).json({ success: false, message: 'Failed to submit application' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const repo = AppDataSource.getRepository(OwnerApplication);
      const qb = repo.createQueryBuilder('app').orderBy('app.createdAt', 'DESC');
      if (status && Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
        qb.where('app.status = :status', { status });
      }
      const [items, total] = await qb.skip((Number(page) - 1) * Number(limit)).take(Number(limit)).getManyAndCount();
      return res.json({ success: true, data: { items, total, page: Number(page), limit: Number(limit) } });
    } catch (error) {
      console.error('[OWNER APPLICATION] List error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: ApplicationStatus };
      if (!Object.values(ApplicationStatus).includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      const repo = AppDataSource.getRepository(OwnerApplication);
      const app = await repo.findOne({ where: { id } });
      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
      app.status = status;
      await repo.save(app);
      return res.json({ success: true, message: 'Status updated', data: app });
    } catch (error) {
      console.error('[OWNER APPLICATION] Update status error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update status' });
    }
  }
}


