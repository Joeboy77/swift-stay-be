import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddCommissionSettings1700000000000 implements MigrationInterface {
    name = 'AddCommissionSettings1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create commission_settings table
        await queryRunner.createTable(
            new Table({
                name: "commission_settings",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "commission_percentage",
                        type: "decimal",
                        precision: 5,
                        scale: 2,
                        default: 5.00,
                        comment: "Commission percentage (e.g., 5.00 for 5%)"
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Insert default commission setting
        await queryRunner.query(`
            INSERT INTO commission_settings (commission_percentage) VALUES (5.00)
        `);

        // Add new columns to bookings table
        await queryRunner.query(`
            ALTER TABLE bookings 
            ADD COLUMN base_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Base room price before commission',
            ADD COLUMN commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Commission amount',
            ADD COLUMN payment_type ENUM('full', 'partial') NOT NULL DEFAULT 'full' COMMENT 'Payment type: full or partial (40%)',
            ADD COLUMN amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Amount already paid by user',
            ADD COLUMN amount_remaining DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Amount remaining to be paid'
        `);

        // Add new columns to room_types table
        await queryRunner.query(`
            ALTER TABLE room_types 
            ADD COLUMN base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Base price before commission',
            ADD COLUMN commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Commission amount',
            ADD COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Total price including commission'
        `);

        // Update existing room_types to set base_price = price and calculate commission
        await queryRunner.query(`
            UPDATE room_types 
            SET 
                base_price = price,
                commission_amount = ROUND(price * 0.05, 2),
                total_price = ROUND(price * 1.05, 2)
            WHERE base_price = 0.00
        `);

        // Update existing bookings to set base_amount = total_amount and calculate commission
        await queryRunner.query(`
            UPDATE bookings 
            SET 
                base_amount = CAST(total_amount AS DECIMAL(10,2)),
                commission_amount = ROUND(CAST(total_amount AS DECIMAL(10,2)) * 0.05, 2),
                amount_paid = CAST(total_amount AS DECIMAL(10,2)),
                amount_remaining = 0.00,
                payment_type = 'full'
            WHERE base_amount = 0.00
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop commission_settings table
        await queryRunner.dropTable("commission_settings");

        // Remove columns from bookings table
        await queryRunner.query(`
            ALTER TABLE bookings 
            DROP COLUMN base_amount,
            DROP COLUMN commission_amount,
            DROP COLUMN payment_type,
            DROP COLUMN amount_paid,
            DROP COLUMN amount_remaining
        `);

        // Remove columns from room_types table
        await queryRunner.query(`
            ALTER TABLE room_types 
            DROP COLUMN base_price,
            DROP COLUMN commission_amount,
            DROP COLUMN total_price
        `);
    }
}
