import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseEntity } from './base-core.entity';

@Entity()
export class QuestionEntity extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  question: string;
}
