import React, { useState } from 'react';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import { useRouter } from 'next/router'
import campaignInstance from '../ethereum/campaign';
import web3 from '../ethereum/web3';

const ContributeForm = ({ campaignAddress }) => {
    const [contribution, setContribution] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage('');

        const campaign = campaignInstance(campaignAddress);

        try {
            const accounts = await web3.eth.getAccounts();
            await campaign.methods.contribute().send({ from: accounts[0], value: web3.utils.toWei(contribution, 'ether') });
            router.reload();
        }
        catch(err) {
            setErrorMessage(err.message);
        }

        setLoading(false);
    };

    return (
        <Form onSubmit={onSubmit} error={!!errorMessage}>
            <Form.Field>
                <label>Amount to contribute</label>
                <Input 
                    label="ether"
                    labelPosition="right"
                    value={contribution}
                    onChange={event => setContribution(event.target.value)}
                />
            </Form.Field>
            <Message error header="Oops!" content={errorMessage} />
            <Button loading={loading} primary>Contribute</Button>
        </Form>
    );   
}

export default ContributeForm;