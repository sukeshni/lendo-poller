"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// import AWS from 'aws-sdk';
var AWS = require("aws-sdk");
var sqs_consumer_1 = require("sqs-consumer");
require("dotenv/config");
var ApiClients_1 = require("./ApiClients");
var bankApiClient = (0, ApiClients_1.BankApiClient)();
var lendoApiClient = (0, ApiClients_1.LendoApiClient)();
var jobRunner = (0, ApiClients_1.JobRunner)();
var credentials = {
    accessKeyId: process.env.ACCESS_KEY_AWS,
    secretAccessKey: process.env.SECRET_AWS
};
// Set the region  
AWS.config.update({
    region: 'eu-west-1',
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey
});
var SQS_QUEUE_URL = 'http://localhost:4566/000000000000/sample-queue';
var app = sqs_consumer_1.Consumer.create({
    queueUrl: SQS_QUEUE_URL,
    handleMessage: function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var body, jobId;
        var _a, _b;
        return __generator(this, function (_c) {
            body = JSON.parse((_a = message.Body) !== null && _a !== void 0 ? _a : "[]");
            jobId = ((_b = body.pop()) === null || _b === void 0 ? void 0 : _b.application_id) || "";
            if (!jobId)
                return [2 /*return*/];
            jobRunner.createJob(function (jobId, stop) { BankPollingTask(jobId, stop); }, jobId);
            return [2 /*return*/];
        });
    }); }
});
app.on('error', function (err) {
    console.error(err.message);
});
app.on('processing_error', function (err) {
    console.error(err.message);
});
app.start();
console.log("Watching my master SQS ...");
var BankPollingTask = function (applicationId, stopPolling) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bankApiClient.getLoanApplicationById(applicationId)];
            case 1:
                response = _a.sent();
                if (bankApiClient.isLoanApplicationProcessed(response.data.status)) {
                    console.log("Job finished for: ", applicationId);
                    stopPolling();
                    lendoApiClient.updateLoanApplicationStatus(response.data['application_id'], response.data['status']);
                }
                return [2 /*return*/];
        }
    });
}); };
