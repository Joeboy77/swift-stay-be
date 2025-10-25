import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("commission_settings")
export class CommissionSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "decimal",
        precision: 5,
        scale: 2,
        default: 5.00,
        comment: "Commission percentage (e.g., 5.00 for 5%)"
    })
    commission_percentage: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
