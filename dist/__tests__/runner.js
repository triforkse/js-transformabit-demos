"use strict";
var path = require('path');
var js_transformabit_1 = require('js-transformabit');
var transformations = require('../src/Main');
var testRoot = path.join(__dirname, '../../tests');
describe('Transformations', function () {
    transformations.forEach(function (t) {
        return it(t.name, function () {
            new js_transformabit_1.TransformationTest(t, testRoot).run();
        });
    });
});
