import { Table, Button } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import campaignInstance from '../ethereum/campaign';

const RequestRow = ({ key, id, request, campaignAddress, approversCount }) => {
    const readyToFinalize = request.approvalCount > approversCount /2;

    const onApprove = async () => {
        const accounts = await web3.eth.getAccounts();
        const campaign = campaignInstance(campaignAddress);
        await campaign.methods.approveRequest(id).send({ from: accounts[0] });
    };

    const onFinalize = async () => {
        const accounts = await web3.eth.getAccounts();
        const campaign = campaignInstance(campaignAddress);
        await campaign.methods.approveRequest(id).send({ from: accounts[0] });
    };

    return (
        <Table.Row key={key} disabled={request.complete} positive={readyToFinalize && !request.complete}>
            <Table.Cell> { id } </Table.Cell>
            <Table.Cell> { request.description } </Table.Cell>
            <Table.Cell> { web3.utils.fromWei(request.value, 'ether') } </Table.Cell>
            <Table.Cell> { request.recipient } </Table.Cell>
            <Table.Cell> { request.approvalCount } / { approversCount }</Table.Cell>
            <Table.Cell> 
                {   request.complete ? null : (
                        <Button basic color='green' onClick={onApprove}>
                            Approve
                        </Button> 
                    )
                }
            </Table.Cell>
            <Table.Cell> 
                {   request.complete ? null : (
                    <Button basic color='teal' onClick={onFinalize}>
                        Finalize
                    </Button> 
                    )
                }
            </Table.Cell>
        </Table.Row>
    )
}

export default RequestRow;