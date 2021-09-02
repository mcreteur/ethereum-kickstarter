const CampaignFactory = artifacts.require("CampaignFactory");
const Campaign = artifacts.require("Campaign");

let campaign;

contract('CampaignFactory', (accounts) => {
  let factory;
  let campaignAddress;

  beforeEach(async () => {
    factory = await CampaignFactory.new();
  });

  it('deploys a factory', () => {
    assert.ok(factory.address);
  }); 

  it('deploys a campaign with minimum contribution and marks caller as the campaign manager', async () => {
    await factory.createCampaign('100');
    [campaignAddress] = await factory.getDeployedCampaigns();

    campaign = await Campaign.at(campaignAddress); 
    assert.ok(campaign.address);
    const manager = await campaign.manager();
    assert.equal(manager, accounts[0]);
  }); 
})

contract('Campaign', (accounts) => {
  beforeEach(async () => {
    campaign = await Campaign.new('100', accounts[0]);
  });

  it('allows to get campaign summary', async () => {
    const summary = await campaign.getSummary();
    assert.equal(summary[0], 100);
    assert.equal(summary[1], 0);
    assert.equal(summary[2], 0);
    assert.equal(summary[3], 0);
    assert.equal(summary[4], accounts[0]);
  })

  it('allows people to contribute money and marks them as approvers', async () => {
    await campaign.contribute({ from: accounts[1], value:  '100'});
    const isContributor = await campaign.approvers(accounts[1]);
    assert(isContributor);
    const nbApprovers = await campaign.approversCount.call()
    assert.equal(nbApprovers, 1);
  }); 

  it('requires a minimum 100 contribution', async () => {
    let error;
    try {
      await campaign.contribute({ from: accounts[1], value:  '50'});
    }
    catch(err) {
      error = err;
    }
    assert.ok(error instanceof Error);
  }); 

  it('allows a manager to make a payment request', async () => {
    await campaign.createRequest('Buy batteries', '100', accounts[5], { from: accounts[0], gas: '1000000'})

    const request = await campaign.requests(0);

    assert.equal(request.description, 'Buy batteries');
    assert.equal(request.value, '100');
    assert.equal(request.recipient, accounts[5]);
    assert.equal(request.complete, false);
    assert.equal(request.approvalCount, 0);
  });

  it('requires to be the manager to make a payment request', async () => {
    let error;
    try {
      await campaign.createRequest('Buy batteries', '100', accounts[5], { from: accounts[3], gas: '1000000'})
    }
    catch(err) {
      error = err;
    }
    assert.ok(error instanceof Error);
  });

  it('allows a contributor to approve a request', async () => {
    await campaign.createRequest('Buy batteries', '100', accounts[5], { from: accounts[0], gas: '1000000'})

    await campaign.contribute({ from: accounts[1], value:  '200'});
    await campaign.approveRequest(0, { from: accounts[1], gas: '1000000'});

    const request = await campaign.requests.call(0);
    assert.equal(request.approvalCount, 1);
  });

  it('requires to be a contributor to approve a request', async () => {
    await campaign.createRequest('Buy batteries', '100', accounts[5], { from: accounts[0], gas: '1000000'})

    let error;
    try {
      await campaign.approveRequest(0, { from: accounts[3], gas: '1000000'})
    }
    catch(err) {
      error = err;
    }
    assert.ok(error instanceof Error);
  });

  it('does not allow a contributor to approve more than one time a request', async () => {
    await campaign.createRequest('Buy batteries', '100', accounts[5], { from: accounts[0], gas: '1000000'})

    await campaign.contribute({ from: accounts[1], value:  '200'});
    await campaign.approveRequest(0, { from: accounts[1], gas: '1000000'});

    let error;
    try {
      await campaign.approveRequest(0, { from: accounts[1], gas: '1000000'})
    }
    catch(err) {
      error = err;
    }
    assert.ok(error instanceof Error);
  });

  it('allows manager to finalize a request', async () => {
    await campaign.contribute({ from: accounts[0], value: web3.utils.toWei('10', 'ether')});

    await campaign.createRequest('Buy batteries', web3.utils.toWei('5', 'ether'), accounts[5], { from: accounts[0], gas: '1000000'});

    await campaign.approveRequest(0, { from: accounts[0], gas: '1000000'});

    await campaign.finalizeRequest(0, { from: accounts[0], gas: '1000000'});

    let request = await campaign.requests.call(0);
    assert.equal(request.complete, true);

    let balance = await web3.eth.getBalance(accounts[5]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);
    assert(balance > 104);
  });

  it('requires to be manager to finalize a request', async () => {
    await campaign.createRequest('Buy batteries', '100', accounts[5], { from: accounts[0], gas: '1000000'})
    await campaign.contribute({ from: accounts[1], value:  '200'});
    await campaign.approveRequest(0, { from: accounts[1], gas: '1000000'});

    let error;
    try {
      await campaign.finalizeRequest(0, { from: accounts[5], gas: '1000000'})
    }
    catch(err) {
      error = err;
    }
    assert.ok(error instanceof Error);
  });

  it('does not allow to finalize a completed request', async () => {
    await campaign.createRequest('Buy batteries', '100', accounts[5], { from: accounts[0], gas: '1000000'})
    await campaign.contribute({ from: accounts[1], value:  '200'});
    await campaign.approveRequest(0, { from: accounts[1], gas: '1000000'});
    await campaign.finalizeRequest(0, { from: accounts[0], gas: '1000000'})

    let error;
    try {
      await campaign.finalizeRequest(0, { from: accounts[0], gas: '1000000'})
    }
    catch(err) {
      error = err;
    }
    assert.ok(error instanceof Error);
  });

  it('requires half of the contributors to approve a request before finalizing it', async () => {
    await campaign.createRequest('Buy batteries', '100', accounts[5], { from: accounts[0], gas: '1000000'})
    await campaign.contribute({ from: accounts[1], value:  '200'});
    await campaign.contribute({ from: accounts[2], value:  '200'});
    await campaign.contribute({ from: accounts[3], value:  '200'});
    await campaign.approveRequest(0, { from: accounts[1], gas: '1000000'});

    let error;
    try {
      await campaign.finalizeRequest(0, { from: accounts[0], gas: '1000000'})
    }
    catch(err) {
      error = err;
    }
    assert.ok(error instanceof Error);
  });
});
