import {Button, Card, Checkbox, Divider, Flex, Group, rem, Space, Switch, Table} from "@mantine/core";
import { useState, useEffect } from "react";
import classes from "./AllRequests.module.css";
import cx from 'clsx';
import {IconMinus, IconPlus} from "@tabler/icons-react";
import {useDisclosure} from "@mantine/hooks";
export function AllRequests() {
    const [requests, setRequests] = useState([]);
    const [selection, setSelection] = useState([]);
    const [loading, { toggle }] = useDisclosure();
    const toggleRow = (id: string) =>
        setSelection((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    const toggleAll = () =>
        setSelection((current) => (current.length === requests.length ? [] : requests.map((item) => item.id)));

    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                const responseTeamDetails = await fetch("https://localhost:7071/api/Report");
                const dataTeamDetails = await responseTeamDetails.json();
                
                const requests = dataTeamDetails.map(async (team) => {
                    let str;
                    if(team.accepted == false)
                    {
                        str = "NIE";
                    }
                    else
                        str = "TAK";
                    const teamResponse = await fetch(`https://localhost:7071/api/TeamEntity/id/`+team.teamEntity_FK2);
                    const dataNumberResponse = await teamResponse.json(); // Poprawka tutaj
                    return { ...team, teamName: dataNumberResponse.teamName, accepted: str }; // Dodajemy nowe pole amountOfMembers
                });

                const requestsDetails = await Promise.all(requests);
                setRequests(requestsDetails);
            } catch (error) {
                console.error('Error fetching requests details:', error);
            }
        };

        fetchTeamDetails();
    }, []);
    async function buttonLogic() {
        const selectedIds = selection.filter(id => id); 
        console.log(selectedIds);
        for (let id of selectedIds) {
            const url = "https://localhost:7071/api/Report/acccept/" + id;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }
        window.location.reload();
    }
    async function buttonLogicReject() {
        const selectedIds = selection.filter(id => id);
        console.log(selectedIds);
        for (let id of selectedIds) {
            const url = "https://localhost:7071/api/Report/reject/" + id;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }
        window.location.reload();
    }
    const downloadPDF = (base64Data) => {
        // Convert base64 to binary
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // Create Blob and URL
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Create temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.pdf');

        // Simulate click to trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
    };

    const rows = requests.map((request) => {
        const selected = selection.includes(request.id);
        return (
            <Table.Tr key={request.id} className={cx({ [classes.rowSelected]: selected })}>
                <Table.Td>
                    <Checkbox checked={selection.includes(request.id)} onChange={() => toggleRow(request.id)} />
                </Table.Td>
                <Table.Td>{request.id}</Table.Td>
                <Table.Td>
                    <Button onClick={() => downloadPDF(request.base64)}>Download PDF</Button>
                </Table.Td>
                <Table.Td>{request.teamName}</Table.Td>
                <Table.Td>{request.accepted}</Table.Td>
            </Table.Tr>
        )
    });

    return (
        <Flex
            gap="sm"
            justify="flex-start"
            align="center"
            alignItems="stretch"
            direction="column"
            wrap="nowrap"
            style={{ height: '100%' }}
        >
            <Card withBorder radius="md" p="xs">
                <Group justify="center">
                    <Button variant={"outline"} rightSection={<IconPlus size={14}/>} loading={loading} onClick = {buttonLogic}>Akceptuj wniosek</Button>
                    <Button rightSection={<IconMinus size={14} />} loading={loading} onClick = {buttonLogicReject}>Odrzuć wniosek</Button>
                </Group>
            </Card>
            <div>
                <Space h="xl" />
                <Table w={'70vh'} stickyHeader stickyHeaderOffset={1} highlightOnHover >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={{ width: rem(40) }}>
                                <Checkbox
                                    onChange={toggleAll}
                                    checked={selection.length === requests.length}
                                    indeterminate={selection.length > 0 && selection.length !== requests.length}
                                />
                            </Table.Th>
                            <Table.Th>Id pliku</Table.Th>
                            <Table.Th>Nazwa pliku</Table.Th>
                            <Table.Th>Nazwa zespołu</Table.Th>
                            <Table.Th>Stan pliku</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </div>
            <Switch checked={loading} onChange={toggle} label="Loading state" mt="md" />
        </Flex>
    );
}
