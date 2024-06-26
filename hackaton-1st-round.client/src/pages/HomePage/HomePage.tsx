import { Flex } from "@mantine/core";
import { Navbar } from "../../layouts/Navbar/Navbar";
import {MainPage} from "../../components/PanelComponents/Both/MainPage/MainPage";

export default function HomePage() {
    return (
        <Flex
            gap="lg"
            justify="center"
            align="flex-start"
            direction="row"
            wrap="nowrap"
        >
            <div style={{ zIndex: 1 }}>
                <Navbar />
            </div>
            <div style={{ zIndex: 0 }}>
                <MainPage/>
            </div>
        </Flex>
    );
}
