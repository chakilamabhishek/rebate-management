const sinon = require('sinon');
const {
    validateTransaction,
    validateRebateProgram,
    validateRebateClaim,
    validateRebateClaimsQuery,
    validateTransactionId,
    validateUser
} = require('../src/middlewares/validationMiddleware.js'); 

const mockRequest = (body = {}, query = {}, params = {}) => ({
    body,
    query,
    params
});

const mockResponse = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
};

const mockNext = () => sinon.stub();

describe('Validation Middleware', () => {
    let expect;

    before(async () => {
        ({ expect } = await import('chai'));
    });

    describe('validateTransaction', () => {
        it('should pass validation for a valid transaction', async () => {
            const req = mockRequest({
                amount: 100,
                transaction_date: '2023-01-01',
                rebate_program_id: 1
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateTransaction) {
                await middleware(req, res, next);
            }

            expect(next.called).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should fail validation for an invalid transaction', async () => {
            const req = mockRequest({
                amount: 'invalid',
                transaction_date: 'invalid-date',
                rebate_program_id: 'invalid'
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateTransaction) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(3);
        });

        it('should fail validation for a missing amount', async () => {
            const req = mockRequest({
                transaction_date: '2023-01-01',
                rebate_program_id: 1
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateTransaction) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(1);
        });
    });

    describe('validateRebateProgram', () => {
        it('should pass validation for a valid rebate program', async () => {
            const req = mockRequest({
                program_name: 'Test Program',
                rebate_percentage: 10,
                start_date: '2023-01-01',
                end_date: '2023-12-31',
                eligibility_criteria: 'Test Criteria'
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateRebateProgram) {
                await middleware(req, res, next);
            }

            expect(next.called).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should fail validation for an invalid rebate program', async () => {
            const req = mockRequest({
                program_name: 123,
                rebate_percentage: 'invalid',
                start_date: 'invalid-date',
                end_date: 'invalid-date',
                eligibility_criteria: 123
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateRebateProgram) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(5);
        });

        it('should fail validation for a missing program name', async () => {
            const req = mockRequest({
                rebate_percentage: 10,
                start_date: '2023-01-01',
                end_date: '2023-12-31',
                eligibility_criteria: 'Test Criteria'
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateRebateProgram) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(1);
        });
    });

    describe('validateRebateClaim', () => {
        it('should pass validation for a valid rebate claim', async () => {
            const req = mockRequest({
                transaction_id: 1,
                claim_date: '2023-01-01'
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateRebateClaim) {
                await middleware(req, res, next);
            }

            expect(next.called).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should fail validation for an invalid rebate claim', async () => {
            const req = mockRequest({
                transaction_id: 'invalid',
                claim_date: 'invalid-date'
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateRebateClaim) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(2);
        });

        it('should fail validation for a missing transaction ID', async () => {
            const req = mockRequest({
                claim_date: '2023-01-01'
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateRebateClaim) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(1);
        });
    });

    describe('validateRebateClaimsQuery', () => {
        it('should pass validation for a valid rebate claims query', async () => {
            const req = mockRequest({}, {
                startDate: '2023-01-01',
                endDate: '2023-12-31'
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateRebateClaimsQuery) {
                await middleware(req, res, next);
            }

            expect(next.called).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should fail validation for an invalid rebate claims query', async () => {
            const req = mockRequest({}, {
                startDate: 'invalid-date',
                endDate: 'invalid-date'
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateRebateClaimsQuery) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(2);
        });

        it('should fail validation for a missing start date', async () => {
            const req = mockRequest({}, {
                endDate: '2023-12-31'
            });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateRebateClaimsQuery) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(1);
        });
    });

    describe('validateTransactionId', () => {
        it('should pass validation for a valid transaction ID', async () => {
            const req = mockRequest({}, {}, { transactionId: 1 });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateTransactionId) {
                await middleware(req, res, next);
            }

            expect(next.called).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should fail validation for an invalid transaction ID', async () => {
            const req = mockRequest({}, {}, { transactionId: 'invalid' });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateTransactionId) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(1);
        });

        it('should fail validation for a missing transaction ID', async () => {
            const req = mockRequest({}, {}, {});
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateTransactionId) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(1);
        });
    });

    describe('validateUser', () => {
        it('should pass validation for a valid user', async () => {
            const req = mockRequest({ user: 'achakilam' });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateUser) {
                await middleware(req, res, next);
            }

            expect(next.called).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should fail validation for an invalid user', async () => {
            const req = mockRequest({ user: 123 });
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateUser) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(1);
        });

        it('should fail validation for a missing user', async () => {
            const req = mockRequest({});
            const res = mockResponse();
            const next = mockNext();

            for (const middleware of validateUser) {
                await middleware(req, res, next);
            }

            expect(res.status.firstCall.args[0]).to.equal(400);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].errors).to.have.lengthOf(1);
        });
    });
});