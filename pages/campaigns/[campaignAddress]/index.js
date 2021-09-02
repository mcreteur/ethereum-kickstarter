import React from 'react';
import { Card, Grid, Button } from 'semantic-ui-react';
import Link from 'next/link';
import web3 from '../../../ethereum/web3';
import Layout from '../../../components/Layout';
import ContributeForm from '../../../components/ContributeForm';
import campaignInstance from '../../../ethereum/campaign';

const CampaignShow = ({ minimumContribution, balance, requestCount, approversCount, manager, campaignAddress }) => {
    const renderCards = () => {
        const items = [
            {
                header: manager,
                meta: 'Address of manager',
                description: 'The manager created this campaign and can create requests to withdraw money',
                style: { overflowWrap: 'break-word'}
            },
            {
                header: minimumContribution,
                meta: 'Minimum contribution (wei)',
                description: 'You must contribute at least this much wei to become an approver',
            },
            {
                header: requestCount,
                meta: 'Number of requests',
                description: 'A request tries to withdraw money from the contract. Requests must be approved by approvers',
            },
            {
                header: approversCount,
                meta: 'Number of contributors',
                description: 'Number of people who have already donated to this campaign',
            },
            {
                header: web3.utils.fromWei(balance, 'ether'),
                meta: 'Campaign balance (eth)',
                description: 'The balance is how much money this campaign has left to spend',
            },
        ];

        return <Card.Group items={items} />
    }

    return (
        <Layout>
            <h3>Campaign details</h3>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={10}>
                        {renderCards()}
                    </Grid.Column>

                    <Grid.Column width={6}>
                        <ContributeForm campaignAddress={campaignAddress} />
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column>
                        <Link href={`/campaigns/${campaignAddress}/requests`}>
                            <a>
                                <Button primary>View requests</Button>
                            </a>
                        </Link>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Layout>
    )
}

export async function getServerSideProps(context) {
    const campaignAddress = context.params.campaignAddress;
    const campaign = campaignInstance(campaignAddress);
    
    const campaignSummary = await campaign.methods.getSummary().call();

    return {
        props: {
            minimumContribution: campaignSummary[0],
            balance: campaignSummary[1],
            requestCount: campaignSummary[2],
            approversCount: campaignSummary[3],
            manager: campaignSummary[4],
            campaignAddress: campaignAddress
        }
    }
}

export default CampaignShow;