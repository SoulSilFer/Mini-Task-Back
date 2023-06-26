import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseEntity } from './base-core.entity';

@Entity()
export class TaskEntity extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  endDate?: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  checked: boolean;
}
