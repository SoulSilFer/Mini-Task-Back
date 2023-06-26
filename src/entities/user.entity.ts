import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  sinceDate!: Date;

  @UpdateDateColumn()
  lastModified!: Date;

  @Column()
  userName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column('jsonb')
  securityQuestions: Record<string, any>[];

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string | null;
}
