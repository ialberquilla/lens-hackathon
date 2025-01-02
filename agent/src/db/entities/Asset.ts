import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Asset {
    @PrimaryGeneratedColumn()
    assetId!: number;

    @Column({ type: "decimal", precision: 20, scale: 2 })
    price!: number;

    @Column({ type: "varchar", length: 1000 })
    description!: string;

    @Column('jsonb', { nullable: true })
    embeddings!: number[];

    @Column({ type: "int", default: 0 })
    likes!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: "varchar", length: 42 })
    contractAddress!: string;

    @Column({ type: "varchar", length: 255 })
    imageUrl!: string;

    @Column({ type: "varchar", length: 255 })
    embeddingsUrl!: string;

    // Virtual field for similarity score (not stored in DB)
    similarity?: number;
} 