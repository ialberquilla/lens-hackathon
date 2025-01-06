import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum AgentLogStatus {
    PENDING = "PENDING",
    ANALYZED = "ANALYZED",
    PURCHASED = "PURCHASED",
    ERROR = "ERROR"
}

@Entity()
export class AgentLog {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 66, name: "transaction_id" })
    transactionId!: string;

    @Column({ type: "varchar", length: 66, name: "transaction_mint", nullable: true })
    transactionMint!: string | null;

    @Column({ type: "varchar", length: 50, name: "agent_type" })
    agentType!: string;

    @Column({
        type: "enum",
        enum: AgentLogStatus,
        default: AgentLogStatus.PENDING
    })
    status!: AgentLogStatus;

    @Column({ type: "boolean", nullable: true })
    decision!: boolean | null;

    @Column({ type: "text", nullable: true })
    feedback!: string | null;

    @Column({ type: "text", nullable: true, name: "error_message" })
    errorMessage!: string | null;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
} 