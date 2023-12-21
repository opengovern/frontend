import { Link, useParams } from 'react-router-dom'
import {
    Button,
    Card,
    Flex,
    Grid,
    List,
    ListItem,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
    Text,
    Title,
} from '@tremor/react'
import {
    ChevronRightIcon,
    Cog8ToothIcon,
    CommandLineIcon,
    DocumentDuplicateIcon,
    FolderIcon,
    Square2StackIcon,
} from '@heroicons/react/24/outline'
import { useSetAtom } from 'jotai/index'
import clipboardCopy from 'clipboard-copy'
import { useState } from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import Layout from '../../../../../../components/Layout'
import { useComplianceApiV1ControlsSummaryDetail } from '../../../../../../api/compliance.gen'
import Header from '../../../../../../components/Header'
import { notificationAtom, queryAtom } from '../../../../../../store'
import { severityBadge } from '../index'
import { dateTimeDisplay } from '../../../../../../utilities/dateDisplay'
import Spinner from '../../../../../../components/Spinner'
import Detail from './Tabs/Detail'
import ImpactedResources from './Tabs/ImpactedResources'
import Benchmarks from './Tabs/Benchmarks'
import Modal from '../../../../../../components/Modal'
import ImpactedAccounts from './Tabs/ImpactedAccounts'

export default function ControlDetail() {
    const { controlId, ws } = useParams()
    const setNotification = useSetAtom(notificationAtom)

    const [openDetail, setOpenDetail] = useState(false)
    const [modalData, setModalData] = useState('')
    const setQuery = useSetAtom(queryAtom)

    const { response: controlDetail, isLoading } =
        useComplianceApiV1ControlsSummaryDetail(String(controlId))

    return (
        <Layout currentPage="compliance">
            <Header
                breadCrumb={[
                    controlDetail
                        ? controlDetail?.control?.title
                        : 'Control detail',
                ]}
                datePicker
            />
            {isLoading ? (
                <Spinner className="mt-56" />
            ) : (
                <>
                    <Flex className="mb-6">
                        <Flex
                            flexDirection="col"
                            alignItems="start"
                            justifyContent="start"
                            className="gap-2"
                        >
                            <Title className="font-semibold whitespace-nowrap">
                                {controlDetail?.control?.title}
                            </Title>
                            <Text className="w-2/3">
                                {controlDetail?.control?.description}
                            </Text>
                        </Flex>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setModalData(
                                    controlDetail?.control?.query?.queryToExecute?.replace(
                                        '$IS_ALL_CONNECTIONS_QUERY',
                                        'true'
                                    ) || ''
                                )
                            }
                        >
                            See query
                        </Button>
                        <Modal
                            open={!!modalData.length}
                            onClose={() => setModalData('')}
                        >
                            <Title className="font-semibold">
                                Metric query
                            </Title>
                            <Card className="my-4">
                                <Editor
                                    onValueChange={() => console.log('')}
                                    highlight={(text) =>
                                        highlight(text, languages.sql, 'sql')
                                    }
                                    value={modalData}
                                    className="w-full bg-white dark:bg-gray-900 dark:text-gray-50 font-mono text-sm"
                                    style={{
                                        minHeight: '200px',
                                    }}
                                    placeholder="-- write your SQL query here"
                                />
                            </Card>
                            <Flex>
                                <Button
                                    variant="light"
                                    icon={DocumentDuplicateIcon}
                                    iconPosition="left"
                                    onClick={() =>
                                        clipboardCopy(modalData).then(() =>
                                            setNotification({
                                                text: 'Query copied to clipboard',
                                                type: 'info',
                                            })
                                        )
                                    }
                                >
                                    Copy
                                </Button>
                                <Flex className="w-fit gap-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setQuery(modalData)
                                        }}
                                    >
                                        <Link to={`/${ws}/query`}>
                                            Open in Query
                                        </Link>
                                    </Button>
                                    <Button onClick={() => setModalData('')}>
                                        Close
                                    </Button>
                                </Flex>
                            </Flex>
                        </Modal>
                    </Flex>
                    <Grid numItems={2} className="w-full gap-4 mb-6">
                        <Card>
                            <Flex
                                flexDirection="col"
                                alignItems="start"
                                className="h-full"
                            >
                                <Flex flexDirection="col" alignItems="start">
                                    <Title className="font-semibold mb-2">
                                        Control detail
                                    </Title>
                                    <List>
                                        <ListItem>
                                            <Text>Control ID</Text>
                                            <Flex className="gap-1 w-fit">
                                                <Button
                                                    variant="light"
                                                    onClick={() =>
                                                        clipboardCopy(
                                                            `Control ID: ${controlDetail?.control?.id}`
                                                        ).then(() =>
                                                            setNotification({
                                                                text: 'Control ID copied to clipboard',
                                                                type: 'info',
                                                            })
                                                        )
                                                    }
                                                    icon={Square2StackIcon}
                                                />
                                                <Text className="text-gray-800">
                                                    {controlDetail?.control?.id}
                                                </Text>
                                            </Flex>
                                        </ListItem>
                                        <ListItem>
                                            <Text>Resource type</Text>
                                            <Flex className="gap-1 w-fit">
                                                <Button
                                                    variant="light"
                                                    onClick={() =>
                                                        clipboardCopy(
                                                            `Resource type: ${controlDetail?.resourceType?.resource_type}`
                                                        ).then(() =>
                                                            setNotification({
                                                                text: 'Resource type copied to clipboard',
                                                                type: 'info',
                                                            })
                                                        )
                                                    }
                                                    icon={Square2StackIcon}
                                                />
                                                <Text className="text-gray-800">
                                                    {
                                                        controlDetail
                                                            ?.resourceType
                                                            ?.resource_type
                                                    }
                                                </Text>
                                            </Flex>
                                        </ListItem>
                                        <ListItem>
                                            <Text>Severity</Text>
                                            {severityBadge(
                                                controlDetail?.control?.severity
                                            )}
                                        </ListItem>
                                        <ListItem>
                                            <Text># of findings</Text>
                                            <Flex className="gap-3 w-fit">
                                                <Flex className="gap-1 w-fit">
                                                    <Text className="text-gray-800">
                                                        Passed:
                                                    </Text>
                                                    <Text className="text-emerald-500">
                                                        {(controlDetail?.totalResourcesCount ||
                                                            0) -
                                                            (controlDetail?.failedResourcesCount ||
                                                                0)}
                                                    </Text>
                                                </Flex>
                                                <Flex className="gap-1 w-fit">
                                                    <Text className="text-gray-800">
                                                        Failed:
                                                    </Text>
                                                    <Text className="text-rose-600">
                                                        {
                                                            controlDetail?.failedResourcesCount
                                                        }
                                                    </Text>
                                                </Flex>
                                                <Text className="text-gray-800">
                                                    {`Total: ${controlDetail?.totalResourcesCount}`}
                                                </Text>
                                            </Flex>
                                        </ListItem>
                                        <ListItem>
                                            <Text>Last updated</Text>
                                            <Text className="text-gray-800">
                                                {dateTimeDisplay(
                                                    controlDetail?.control
                                                        ?.updatedAt
                                                )}
                                            </Text>
                                        </ListItem>
                                    </List>
                                </Flex>
                                <Flex justifyContent="end">
                                    <Button
                                        variant="light"
                                        icon={ChevronRightIcon}
                                        iconPosition="right"
                                        onClick={() => setOpenDetail(true)}
                                    >
                                        See more
                                    </Button>
                                </Flex>
                            </Flex>
                        </Card>
                        <Grid numItems={2} className="w-full gap-4">
                            <Card>
                                <FolderIcon className="w-6" />
                                <Title className="font-semibold mt-2">
                                    Manual
                                </Title>
                                <Flex>
                                    <Text>Remediation</Text>
                                    <Button
                                        variant="light"
                                        icon={ChevronRightIcon}
                                        iconPosition="right"
                                    >
                                        See more
                                    </Button>
                                </Flex>
                            </Card>
                            <Card>
                                <CommandLineIcon className="w-6" />
                                <Title className="font-semibold mt-2">
                                    Command line (CLI)
                                </Title>
                                <Flex>
                                    <Text>Remediation</Text>
                                    <Button
                                        variant="light"
                                        icon={ChevronRightIcon}
                                        iconPosition="right"
                                    >
                                        See more
                                    </Button>
                                </Flex>
                            </Card>
                            <Card>
                                <Cog8ToothIcon className="w-6" />
                                <Title className="font-semibold mt-2">
                                    Guard rails
                                </Title>
                                <Flex>
                                    <Text>Remediation</Text>
                                    <Button
                                        variant="light"
                                        icon={ChevronRightIcon}
                                        iconPosition="right"
                                    >
                                        See more
                                    </Button>
                                </Flex>
                            </Card>
                        </Grid>
                    </Grid>
                    <TabGroup>
                        <TabList>
                            <Tab>Impacted resources</Tab>
                            <Tab>Impacted accounts</Tab>
                            <Tab>Control information</Tab>
                            <Tab>Benchmarks</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <ImpactedResources
                                    controlId={controlDetail?.control?.id}
                                />
                            </TabPanel>
                            <TabPanel>
                                <ImpactedAccounts
                                    controlId={controlDetail?.control?.id}
                                />
                            </TabPanel>
                            <TabPanel>
                                <Detail control={controlDetail?.control} />
                            </TabPanel>
                            <TabPanel>
                                <Benchmarks
                                    benchmarks={controlDetail?.benchmarks}
                                />
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </>
            )}
        </Layout>
    )
}