var SectorAlarmError = require('../lib/sectoralarmerror.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
const sinon = require('sinon');

describe('sectoralarmerror.js', function() {

    describe('#toJson', function () {
        it('can produce output with inner error', function () {
            var error = new SectorAlarmError('code', 'message', new Error('innerError'));
            var json = error.toJson();
            json.stack = undefined;
            json.originalError.stack = undefined;
            var expectedOutput = {
                "code": "code",
                "message": "message",
                "originalError": { "message": "innerError" }
                };
            
            assert.equal(JSON.stringify(json), JSON.stringify(expectedOutput));

        });        

        it('can produce output without inner error', function () {
            var error = new SectorAlarmError('code', 'message');
            var json = error.toJson();
            json.stack = undefined;
            var expectedOutput = {
                "code": "code",
                "message": "message"
                };
            
            assert.equal(JSON.stringify(json), JSON.stringify(expectedOutput));
        });        
    });

    describe('#constructor', function () {

        it('when passing a message, message property should be set', function () {
            var error = new SectorAlarmError('code', 'message');
            assert.equal(error.message, 'message');
        });

        it('when passing a code, code property should be set', function () {
            var error = new SectorAlarmError('code', 'message');
            assert.equal(error.code, 'code');
        });

        it('when creating the error, name should be set', function () {
            var error = new SectorAlarmError('code', 'message');
            assert.equal(error.name, 'SectorAlarmError');
        });

        it('when creating the error, stack should be populated', function () {
            var error = new SectorAlarmError('code', 'message');
            assert.isNotEmpty(error.stack);
        });

        it('when passing original error, innerError is set', function () {
            var error = new SectorAlarmError('code', 'message', new Error('innerError'));
            assert.isNotNull(error.innerError);
            assert.equal(error.innerError.message, 'innerError');
        });

        it('error should be recoqnized by nodejs', function () {
            var error = new SectorAlarmError('code', 'message', new Error('innerError'));
            assert(require('util').isError(error));
        });
    

    });
});
