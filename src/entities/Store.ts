import { Entity, PrimaryGeneratedColumn, Column, } from 'typeorm';

@Entity()
export class Store {
    @PrimaryGeneratedColumn('uuid')
    storeId: string;

    @Column({ unique: true })
    mallname: string;

    @Column({ unique: true })
    location: string;

    @Column({ unique: true })
    phone: string;
}