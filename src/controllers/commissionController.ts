import { Request, Response } from 'express';
import { commissionService } from '../services/commissionService';
import { authenticateAdmin } from '../middleware/adminAuth';

export class CommissionController {
  // Get current commission percentage
  async getCommissionSettings(req: Request, res: Response) {
    try {
      const percentage = await commissionService.getCommissionPercentage();
      
      res.json({
        success: true,
        data: {
          commission_percentage: percentage
        }
      });
    } catch (error) {
      console.error('Error getting commission settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get commission settings'
      });
    }
  }

  // Update commission percentage
  async updateCommissionSettings(req: Request, res: Response) {
    try {
      const { commission_percentage } = req.body;

      if (typeof commission_percentage !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Commission percentage must be a number'
        });
      }

      const result = await commissionService.updateCommissionPercentage(commission_percentage);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error updating commission settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update commission settings'
      });
    }
  }

  // Calculate commission breakdown for a given amount
  async calculateCommission(req: Request, res: Response) {
    try {
      const { baseAmount } = req.body;

      if (typeof baseAmount !== 'number' || baseAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Base amount must be a positive number'
        });
      }

      const percentage = await commissionService.getCommissionPercentage();
      const breakdown = commissionService.calculateCommission(baseAmount, percentage);
      const paymentOptions = commissionService.calculatePartialPayment(breakdown.totalAmount);

      res.json({
        success: true,
        data: {
          baseAmount: breakdown.baseAmount,
          commissionPercentage: percentage,
          commissionAmount: breakdown.commissionAmount,
          totalAmount: breakdown.totalAmount,
          paymentOptions: {
            partial: {
              amount: paymentOptions.partialAmount,
              percentage: 40,
              description: 'Pay 40% now, 60% on arrival'
            },
            full: {
              amount: breakdown.totalAmount,
              percentage: 100,
              description: 'Pay full amount now'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error calculating commission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate commission'
      });
    }
  }
}

export const commissionController = new CommissionController();
