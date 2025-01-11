const { EntitySchema } = require("typeorm");

const RebateProgram = new EntitySchema({
    name: "RebateProgram",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        program_name: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        rebate_percentage: {
            type: "decimal",
            precision: 5,
            scale: 2,
            nullable: false,
        },
        start_date: {
            type: "date",
            nullable: false,
        },
        end_date: {
            type: "date",
            nullable: false,
        },
        eligibility_criteria: {
            type: "varchar",
            length: 500,
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
            name: "IDX_PROGRAM_NAME",
            columns: ["program_name"],
        },
        {
            name: "IDX_START_DATE",
            columns: ["start_date"],
        },
        {
            name: "IDX_END_DATE",
            columns: ["end_date"],
        },
    ],
    options: {
        softDelete: true,
    },
});

module.exports = RebateProgram;