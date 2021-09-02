import React from 'react';
import { Card, Button, Header } from 'semantic-ui-react'
import Link from 'next/link';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';

const CampaignIndex = (props) => {
    const renderCampaignList = () => {
        const campaignList = props.campaigns.map(campaignAddress => {
            return {
                header: campaignAddress,
                description: <Link href={`/campaigns/${campaignAddress}`}><a>View campaign</a></Link>,
                fluid: true
            }
        });
        return <Card.Group items={campaignList}></Card.Group>;
    }

    return (
        <Layout>
            <div>
                <Header as='h3'>Open campaigns</Header>
                <Link href="/campaigns/new">
                    <a>
                        <Button 
                            primary
                            floated='right'
                            content="Create Campaign"
                            icon="add"
                        />
                    </a>
                </Link>
                {renderCampaignList()}
            </div>
        </Layout>
    )
}

export async function getServerSideProps() {
    const campaigns = await factory.methods.getDeployedCampaigns().call();
    return { props: { campaigns } }
}

export default CampaignIndex;