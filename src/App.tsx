import { Container } from "@mui/material";
import Layout from "./components/Layout";
import Header from "./components/Header";
import WordleBot from "./components/WordleBot";

function App() {
    return (
        <Layout>
            <Container maxWidth="sm">
                <Header />
                <WordleBot />
            </Container>
        </Layout>
    );
}

export default App;
