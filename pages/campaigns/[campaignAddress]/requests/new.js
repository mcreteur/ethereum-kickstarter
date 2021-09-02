import { useState } from "react";
import { Form, Input, Button, Message } from "semantic-ui-react";
import { useRouter } from 'next/router'
import Layout from "../../../../components/Layout";
import campaignInstance from "../../../../ethereum/campaign";
import web3 from "../../../../ethereum/web3";

const RequestNew = ({ campaignAddress }) => {
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');
    const [recipient, setRecipient] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (event) => {
        event.preventDefault();

        const campaign = campaignInstance(campaignAddress);

        setLoading(true);
        setErrorMessage('');
        try {
            const accounts = await web3.eth.getAccounts();
            await campaign.methods.createRequest(description, web3.utils.toWei(value, 'ether'), recipient).send({ from: accounts[0] });
            router.push(`/campaigns/${campaignAddress}/requests`);
        }
        catch(err) {
            setErrorMessage(err.message);
        }
        setLoading(false);
    }

    return (
        <Layout>
            <h3>Create a request</h3>
            <Form onSubmit={onSubmit} error={!!errorMessage}>
                <Form.Field>
                    <label>Description</label>
                    <Input 
                        value={description}
                        onChange={event => setDescription(event.target.value)}
                        />
                </Form.Field>
                <Form.Field>
                    <label>Value in Eth</label>
                    <Input 
                        value={value}
                        onChange={event => setValue(event.target.value)}
                        />
                </Form.Field>
                <Form.Field>
                    <label>Recipient</label>
                    <Input 
                        value={recipient}
                        onChange={event => setRecipient(event.target.value)}
                        />
                </Form.Field>
                <Message error header="Oops!" content={errorMessage} />
                <Button primary loading={loading}>Create</Button>
            </Form>
        </Layout>
    )
}

export async function getServerSideProps(context) {
    const campaignAddress = context.params.campaignAddress;

    return {
        props: {
            campaignAddress: campaignAddress
        }
    }
}

export default RequestNew;