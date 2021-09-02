import React from 'react';
import Navbar from './Navbar';
import { Container } from 'semantic-ui-react';

const Layout = (props) => {
    return (
        <Container>
            <Navbar/>
            { props.children }
        </Container>
    );
}

export default Layout;