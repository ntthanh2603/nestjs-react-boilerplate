import { BaseEntity } from 'src/common/entities/base.entity';
import { Members } from 'src/modules/members/entities/member.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'logging' })
export class Logging extends BaseEntity {
  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'text', nullable: true })
  context: string;

  @Column({ type: 'text' })
  status: 'SUCCESS' | 'FAILURE';

  @Column('json', { nullable: true })
  details: Record<string, any>;

  @Column({ type: 'text', name: 'member_id' })
  memberId: string;

  @ManyToOne(() => Members, (member) => member.logging)
  @JoinColumn({ name: 'member_id' })
  member: Members;
}
