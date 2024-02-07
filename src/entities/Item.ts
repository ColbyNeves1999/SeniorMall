import { Entity, PrimaryGeneratedColumn, Column, } from 'typeorm';

@Entity()
export class Item {
    @PrimaryGeneratedColumn('uuid')
    itemId: string;

    @Column()
    stock: number;

}