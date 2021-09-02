import web3 from "./web3";
import Campaign from './build/contracts/Campaign.json';

const campaignInstance = (campaignAddress) => { 
    return new web3.eth.Contract(Campaign.abi, campaignAddress); 
}

export default campaignInstance;