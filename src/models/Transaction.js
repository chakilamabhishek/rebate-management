const { EntitySchema } = require("typeorm");

const Transaction = new EntitySchema({
    name: "Transaction",
    columns: {
        transaction_id: {
            primary: true,
            type: "int",
            generated: true,
        },
        amount: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: false,
        },
        transaction_date: {
            type: "date",
            nullable: false,
        },
        rebate_program_id: {
            type: "int",
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
            name: "IDX_REBATE_PROGRAM_ID",
            columns: ["rebate_program_id"],
        },
        {
            name: "IDX_TRANSACTION_DATE",
            columns: ["transaction_date"],
        },
        {
            name: "IDX_TRANSACTION_ID",
            columns: ["transaction_id"],
        }
    ],
    relations: {
        rebateProgram: {
            target: "RebateProgram",
            type: "many-to-one",
            joinColumn: { name: "rebate_program_id" },
            onDelete: "CASCADE",
        },
    },
    options: {
        softDelete: true,
    },
});

module.exports = Transaction;