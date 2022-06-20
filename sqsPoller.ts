import * as AWS from 'aws-sdk';
import { Consumer } from 'sqs-consumer';
import 'dotenv/config';
import {BankApiClient, JobRunner, LendoApiClient} from "./ApiClients"

type Function = () => void;

const bankApiClient =  BankApiClient();
const lendoApiClient =  LendoApiClient();
const jobRunner =  JobRunner();

const credentials = {
   accessKeyId: process.env.ACCESS_KEY_AWS as string,
   secretAccessKey: process.env.SECRET_AWS  as string,
}

// Set the region  
AWS.config.update({
  region: 'eu-west-1',
  accessKeyId: credentials.accessKeyId,
  secretAccessKey: credentials.secretAccessKey
});

const SQS_QUEUE_URL = 'http://localhost:4566/000000000000/sample-queue'

const app = Consumer.create({
  queueUrl: SQS_QUEUE_URL,
  handleMessage: async (message) => {
    const body = JSON.parse(message.Body ?? "[]");
    const jobId = body.pop()?.application_id || "";
    if(!jobId) return;

    jobRunner.createJob(
      (jobId: string, stop: Function) => {BankPollingTask(jobId, stop)},
      jobId
    );
    // handle SQS job still pending
  }
});


app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.start();
console.log("Watching SQS ...");


const BankPollingTask = async (applicationId: string, stopPolling: Function) => {
  const response = await bankApiClient.getLoanApplicationById(applicationId);

  if(bankApiClient.isLoanApplicationProcessed(response.data.status)) {
    console.log("Job finished for: ", applicationId);
    stopPolling();

    lendoApiClient.updateLoanApplicationStatus(response.data['application_id'], response.data['status'] )
  }
}