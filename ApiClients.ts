import axios from 'axios'

type Function = () => void;

export const JobRunner = () => {
  let jobId: string;

  let mainJob: any;
  let stopJob: Function = () => {};
  const maxRetriesCount = 5; 

  const createJob = (job: any, id: string) => {
    console.log("*********");
    console.log("Recieved new job: ", id);
    console.log("*********");
    
    mainJob = job;
    jobId = id;
    
    _runJobWithRetry();
  }

   const _runJobWithRetry = () => {
    const INTERVAL_MILLS = 5000; // 5 seconds
    let retry = 0;
    
    const poller = setInterval(async () => {
      stopJob = () => {
        clearInterval(poller)
      };
      
      retry += 1;
      if(retry > maxRetriesCount) {
        console.log('Stopping attempts after max retries for jobId: ', jobId);
        clearInterval(poller);
        return;
      }

      console.log('Attempt: ', retry, 'for ', jobId);
      mainJob(jobId, stopJob);
    }, INTERVAL_MILLS);
  }

  return {
    createJob,
  }
}

export const LendoApiClient = () => {

  const LendoWebApiUrl = "http://localhost:3000/api";
  const updateLoanApplicationEndpoint = `${LendoWebApiUrl}/update_loan_application`
  
  const updateLoanApplicationStatus = async (applicationId: string, status: string) => {
    try {
      await axios.put(
        updateLoanApplicationEndpoint,
        { data: { application_id: applicationId, status: status } }
      );
    } catch (error) {
      // TODO add retry if API error
      console.log("Api error", error); 
    }
  }

  return {
    updateLoanApplicationStatus
  }
}

export const BankApiClient = () => {

  const BankApiUrl = "http://localhost:8000/api";
  const getLoanApplicationByIdEndpoint = `${BankApiUrl}/jobs`;

  const getLoanApplicationById = async (applicationId: string) => {
    return await axios.get(
      getLoanApplicationByIdEndpoint, 
      { params: { application_id: applicationId } }
    );
    // TODO add retry if API error
  }

  const isLoanApplicationProcessed = (status: string): boolean => {
    return ["completed", "rejected"].includes(status);
  }

  return {
    isLoanApplicationProcessed,
    getLoanApplicationById
  }
}
