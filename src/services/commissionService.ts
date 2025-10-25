import AppDataSource from '../config/data-source';
import { CommissionSettings } from '../models/CommissionSettings';

export class CommissionService {
  private commissionRepository = AppDataSource.getRepository(CommissionSettings);

  async getCommissionPercentage(): Promise<number> {
    try {
      const settings = await this.commissionRepository.findOne({
        where: { id: 1 }
      });
      
      return settings ? Number(settings.commission_percentage) : 5.00;
    } catch (error) {
      console.error('Error getting commission percentage:', error);
      return 5.00; // Default fallback
    }
  }

  async updateCommissionPercentage(percentage: number): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Validate percentage
      if (percentage < 0) {
        return {
          success: false,
          message: 'Commission percentage cannot be negative'
        };
      }

      if (percentage > 100) {
        return {
          success: false,
          message: 'Commission percentage cannot exceed 100%'
        };
      }

      // Get or create settings
      let settings = await this.commissionRepository.findOne({
        where: { id: 1 }
      });

      if (!settings) {
        settings = this.commissionRepository.create({
          commission_percentage: percentage
        });
      } else {
        settings.commission_percentage = percentage;
      }

      await this.commissionRepository.save(settings);

      // Update all existing room types with new commission
      await this.updateAllRoomTypeCommissions(percentage);

      return {
        success: true,
        message: 'Commission percentage updated successfully',
        data: {
          commission_percentage: percentage
        }
      };
    } catch (error) {
      console.error('Error updating commission percentage:', error);
      return {
        success: false,
        message: 'Failed to update commission percentage'
      };
    }
  }

  private async updateAllRoomTypeCommissions(percentage: number): Promise<void> {
    try {
      const roomTypeRepository = AppDataSource.getRepository('RoomType');
      
      // Update all room types with new commission calculation
      await roomTypeRepository.query(`
        UPDATE room_types 
        SET 
          base_price = price,
          commission_amount = ROUND(price * ? / 100, 2),
          total_price = ROUND(price * (1 + ? / 100), 2)
        WHERE base_price = 0.00 OR commission_amount = 0.00
      `, [percentage, percentage]);

      // Update existing room types that already have commission
      await roomTypeRepository.query(`
        UPDATE room_types 
        SET 
          commission_amount = ROUND(base_price * ? / 100, 2),
          total_price = ROUND(base_price * (1 + ? / 100), 2)
        WHERE base_price > 0.00
      `, [percentage, percentage]);
    } catch (error) {
      console.error('Error updating room type commissions:', error);
    }
  }

  calculateCommission(baseAmount: number, percentage: number): {
    baseAmount: number;
    commissionAmount: number;
    totalAmount: number;
  } {
    const commissionAmount = Math.round(baseAmount * (percentage / 100) * 100) / 100;
    const totalAmount = Math.round((baseAmount + commissionAmount) * 100) / 100;

    return {
      baseAmount,
      commissionAmount,
      totalAmount
    };
  }

  calculatePartialPayment(totalAmount: number): {
    partialAmount: number;
    remainingAmount: number;
  } {
    const partialAmount = Math.round(totalAmount * 0.4 * 100) / 100; // 40%
    const remainingAmount = Math.round((totalAmount - partialAmount) * 100) / 100;

    return {
      partialAmount,
      remainingAmount
    };
  }
}

export const commissionService = new CommissionService();
