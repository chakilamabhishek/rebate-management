const { EntitySchema } = require("typeorm");

const RebateClaim = new EntitySchema({
    name: "RebateClaim",
    columns: {
        claim_id: {
            primary: true,
            type: "int",
            generated: true,
        },
        transaction_id: {
            type: "int",
            nullable: false,
        },
        claim_amount: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: false,
        },
        claim_status: {
            type: "enum",
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            nullable: false,
        },
        claim_date: {
            type: "date",
            nullable: false,
        },
        created_at: {
            type: "timestamp",
            createDate: true,
        },
        updated_at: {
            type: "timestamp",
            updateDate: true,
        },
        deleted_at: {
            type: "timestamp",
            nullable: true,
            deleteDate: true,
        },
    },
    indices: [
        {
            name: "IDX_UNIQUE_TRANSACTION_CLAIM",
            columns: ["transaction_id"],
            unique: true, // Add a unique constraint to prevent duplicate claims for the same transaction.
        },
        {
            name: "IDX_CLAIM_STATUS",
            columns: ["claim_status"],
        },
        {
            name: "IDX_CLAIM_DATE",
            columns: ["claim_date"],
        },
    ],
    relations: {
        transaction: {
            target: "Transaction",
            type: "many-to-one",
            joinColumn: { name: "transaction_id" },
            onDelete: "CASCADE",
        },
    },
    options: {
        softDelete: true,
    },
});

module.exports = RebateClaim;