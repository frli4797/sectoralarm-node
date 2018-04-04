var Site = require('../lib/site.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
const sinon = require('sinon');
const parser = require('../lib/parser.js');

describe('parser.js', function() {

    describe('#transformStatusToOutput', function () {

        it('a status input is transformed correctly', function() {

            var input = JSON.stringify({
                "Panel": {
                    "PanelId": 1000,
                    "PanelDisplayName": "Home",
                    "ArmedStatus": "armed",
                    "PartialAvalible": true
                },
                "user": "a user"
            });

            return parser.transformStatusToOutput(input)
                    .then(output => {
                        expect(output.siteId).to.be.equal(1000);
                        expect(output.name).to.be.equal("Home");
                        expect(output.armedStatus).to.be.equal("armed");
                        expect(output.partialArmingAvailable).to.be.equal(true);
                        expect(output.user).to.be.equal("a user");
                    });
        });

        it('partially armed statuses are transformed to camelCase', function() {

            var input = JSON.stringify({
                "Panel": {
                    "PanelId": 1000,
                    "PanelDisplayName": "Home",
                    "ArmedStatus": "partialarmed",
                    "PartialAvalible": true
                },
                "user": "a user"
            });

            return parser.transformStatusToOutput(input)
                    .then(output => {
                        expect(output.armedStatus).to.be.equal("partialArmed");
                    });                    
        });

        it('invalid input throws parsing error', function() {

            return parser.transformStatusToOutput('not json string')
                .then(output => {
                    assert.fail();
                })
                .catch(error => {
                    expect(error.code).to.be.equal('ERR_PARSING_ERROR');
                })
        });
    });

    describe('#transformHistoryToOutput', function () {

        it('a history input is transformed correctly', function() {

            var input = JSON.stringify({
                "LogDetails":[{
                    "Time": '2017-06-18T16:17:00',
                    "EventType": "armed",
                    "User": "a person"
                },
                {
                    "Time": '2017-06-18T16:17:00',
                    "EventType": "armed",
                    "User": "a person"
                }]
            });

            return parser.transformHistoryToOutput(input)
                    .then(output => {
                        expect(output[0].time).to.be.equal('2017-06-18 16:17:00');
                        expect(output[0].action).to.be.equal("armed");
                        expect(output[0].user).to.be.equal("a person");
                    });
        });

        it('a history input with two records, returns two transformed records', function() {

            var input = JSON.stringify({
                "LogDetails":[{
                    "Time": '2017-06-18T16:17:00',
                    "EventType": "armed",
                    "User": "a person"
                },
                {
                    "Time": '2017-06-18T16:17:00',
                    "EventType": "armed",
                    "User": "a person"
                }]
            });

            return parser.transformHistoryToOutput(input)
                    .then(output => {
                        assert.isArray(output);
                        expect(output.length).to.be.equal(2);
                    });
        });

        it('a history input with two records, when filtering top 1 returns one transformed record', function() {

            var input = JSON.stringify({
                "LogDetails":[{
                    "Time": '2017-06-18T16:17:00',
                    "EventType": "armed",
                    "User": "a person"
                },
                {
                    "Time": '2017-06-18T16:17:00',
                    "EventType": "armed",
                    "User": "a person"
                }]
            });

            return parser.transformHistoryToOutput(input, 1)
                    .then(output => {
                        assert.isArray(output);
                        expect(output.length).to.be.equal(1);
                    });
        });

        it('a history input partially armed status, is transformed to camelCase', function() {

            var input = JSON.stringify({
                "LogDetails":[{
                    "Time": '2017-06-18T16:17:00',
                    "EventType": "partialarmed",
                    "User": "a person"
                }]
            });

            return parser.transformHistoryToOutput(input)
                    .then(output => {
                        expect(output[0].action).to.be.equal('partialArmed');
                    });
        });    
        
        it('a history inputs user is Kod, translate to Code', function() {

            var input = JSON.stringify({
                "LogDetails":[{
                    "Time": '2017-06-18T16:17:00',
                    "EventType": "partialarmed",
                    "User": "Kod"
                }]
            });

            return parser.transformHistoryToOutput(input)
                    .then(output => {
                        expect(output[0].user).to.be.equal('Code');
                    });
        });  

        it('invalid input throws parsing error', function() {

            return parser.transformHistoryToOutput('not json string')
                .then(output => {
                    assert.fail();
                })
                .catch(error => {
                    expect(error.code).to.be.equal('ERR_PARSING_ERROR');
                })
        });
    });

    describe('#transformActionToOutput', function () {

        it('an action input is transformed correctly', function() {

            var input = JSON.stringify({
                "panelData": {
                    "PanelDisplayName": "Home",
                    "ArmedStatus": "armed",
                },
                "status": "success"
            });
    
            return parser.transformActionToOutput(input)
                .then(output => {
                    expect(output.status).to.be.equal('success');
                    expect(output.name).to.be.equal('Home');
                    expect(output.armedStatus).to.be.equal('armed');
                });
        });

        it('an action that was not successful, should throw error', function() {

            var input = JSON.stringify({
                "panelData": {
                    "PanelDisplayName": "Home",
                    "ArmedStatus": "armed",
                },
                "status": "failed"
            });
    
            return parser.transformActionToOutput(input)
                .then(output => {
                   assert.fail();
                })
                .catch(error => {
                    expect(error.code).to.be.equal('ERR_INVALID_CODE');
                });
        });

        it('partially armed statuses are transformed to camelCase', function() {

            var input = JSON.stringify({
                "panelData": {
                    "PanelDisplayName": "Home",
                    "ArmedStatus": "partialarmed",
                },
                "status": "success"
            });
    
            return parser.transformActionToOutput(input)
                .then(output => {
                    expect(output.armedStatus).to.be.equal('partialArmed');
                });
        });

        it('invalid input throws parsing error', function() {

            return parser.transformActionToOutput('not json string')
                .then(output => {
                    assert.fail();
                })
                .catch(error => {
                    expect(error.code).to.be.equal('ERR_PARSING_ERROR');
                });
        });
    });
});