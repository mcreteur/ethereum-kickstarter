import Layout from "../../../../components/Layout";
import { Button, Table } from 'semantic-ui-react';
import Link from "next/link";
import campaignInstance from "../../../../ethereum/campaign";
import RequestRow from "../../../../components/RequestRow";

const Requests = ({ campaignAddress, requests, requestCount, approversCount }) => {
    const renderRows = () => {
        return requests.map((request, index) => {
            return <RequestRow key={index} id={index} request={request} campaignAddress={campaignAddress} approversCount={approversCount} />
        })
    }

    return (
        <Layout>
            <h3>Requests</h3>
            <Link href={`/campaigns/${campaignAddress}/requests/new`}>
                <a>
                    <Button primary floated='right' style={{ marginBottom: 10 }}>Create a request</Button>
                </a>
            </Link>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell> ID </Table.HeaderCell>
                        <Table.HeaderCell> Description </Table.HeaderCell>
                        <Table.HeaderCell> Amount </Table.HeaderCell>
                        <Table.HeaderCell> Recipient </Table.HeaderCell>
                        <Table.HeaderCell> Approval count </Table.HeaderCell>
                        <Table.HeaderCell> Approve </Table.HeaderCell>
                        <Table.HeaderCell> Finalize </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    { renderRows() }
                </Table.Body>
            </Table>
            <div>Found {requestCount} requests</div>
        </Layout>
    )
}

export async function getServerSideProps(context) {
    const campaignAddress = context.params.campaignAddress;
    const campaign = campaignInstance(campaignAddress);

    const approversCount = await campaign.methods.approversCount().call();
    
    const requestCount = await campaign.methods.requestCount().call();
    const requests = await Promise.all(
        Array(parseInt(requestCount)).fill().map((element, index) => {
            return campaign.methods.requests(index).call()
        })
    );

    return {
        props: {
            campaignAddress: campaignAddress,
            approversCount: approversCount,
            //Workaround to avoid error serializing requests content...
            requests: JSON.parse(JSON.stringify(requests)),
            requestCount: requestCount
        }
    }
}

export default Requests;