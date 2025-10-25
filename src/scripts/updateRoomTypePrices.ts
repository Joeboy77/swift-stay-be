import 'reflect-metadata';
import AppDataSource from '../config/database';
import { RoomType } from '../models/RoomType';
import { commissionService } from '../services/commissionService';

async function updateRoomTypePrices() {
  try {
    console.log('🔄 Starting room type price update...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const roomTypeRepository = AppDataSource.getRepository(RoomType);
    
    // Get all room types
    const roomTypes = await roomTypeRepository.find();
    console.log(`📊 Found ${roomTypes.length} room types to update`);

    // Get current commission percentage
    const commissionPercentage = await commissionService.getCommissionPercentage();
    console.log(`💰 Current commission percentage: ${commissionPercentage}%`);

    let updatedCount = 0;

    for (const roomType of roomTypes) {
      // Check if this room type needs updating
      // If basePrice is 0, it means this room type was created before the commission system
      console.log(`🔍 Checking ${roomType.name}: basePrice=${roomType.basePrice} (type: ${typeof roomType.basePrice})`);
      if (Number(roomType.basePrice) === 0) {
        console.log(`🔄 Updating room type: ${roomType.name} (current price: ${roomType.price})`);
        
        // Calculate new price with commission
        const basePrice = Number(roomType.price); // Current price is the base price
        const commissionBreakdown = commissionService.calculateCommission(basePrice, commissionPercentage);
        
        // Update the room type
        roomType.basePrice = commissionBreakdown.baseAmount;
        roomType.commissionAmount = commissionBreakdown.commissionAmount;
        roomType.totalPrice = commissionBreakdown.totalAmount;
        roomType.price = commissionBreakdown.totalAmount; // Update the main price field
        
        await roomTypeRepository.save(roomType);
        updatedCount++;
        
        console.log(`✅ Updated ${roomType.name}: ${basePrice} → ${commissionBreakdown.totalAmount} (${commissionPercentage}% commission)`);
      } else {
        console.log(`⏭️  Skipping ${roomType.name} (already has commission applied)`);
      }
    }

    console.log(`🎉 Update complete! Updated ${updatedCount} room types`);
    
  } catch (error) {
    console.error('❌ Error updating room type prices:', error);
  } finally {
    // Close database connection
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
updateRoomTypePrices();
