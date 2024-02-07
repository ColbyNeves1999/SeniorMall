import { Entity, PrimaryGeneratedColumn, Column, } from 'typeorm';

@Entity()
export class Mall {
    @PrimaryGeneratedColumn('uuid')
    storeId: string;

    @Column({ unique: true })
    storename: string;

    @Column({ unique: true })
    location: string;
}