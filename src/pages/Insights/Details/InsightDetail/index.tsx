import {
    Button,
    Callout,
    Card,
    Col,
    Flex,
    Grid,
    Select,
    SelectItem,
    Tab,
    TabGroup,
    TabList,
    Text,
    Title,
} from '@tremor/react'
import { Link } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { GridOptions } from 'ag-grid-community'
import 'ag-grid-enterprise'
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'
import { highlight, languages } from 'prismjs'
import Editor from 'react-simple-code-editor'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import clipboardCopy from 'clipboard-copy'
import {
    useComplianceApiV1InsightDetail,
    useComplianceApiV1InsightTrendDetail,
} from '../../../../api/compliance.gen'
import { IFilter, notificationAtom, queryAtom } from '../../../../store'
import Spinner from '../../../../components/Spinner'
import InsightTablePanel from './InsightTablePanel'
import { snakeCaseToLabel } from '../../../../utilities/labelMaker'
import {
    badgeTypeByDelta,
    percentageByChange,
} from '../../../../utilities/deltaType'
import { dateDisplay } from '../../../../utilities/dateDisplay'
import Header from '../../../../components/Header'
import Table, { IColumn } from '../../../../components/Table'
import Chart from '../../../../components/Chart'
import SummaryCard from '../../../../components/Cards/SummaryCard'
import { BarChartIcon, LineChartIcon } from '../../../../icons/icons'
import Modal from '../../../../components/Modal'

export const chartData = (inputData: any) => {
    const label = []
    const data = []
    if (inputData && inputData.length) {
        for (let i = 0; i < inputData?.length; i += 1) {
            label.push(dateDisplay((inputData[i]?.timestamp || 0) * 1000))
            data.push(inputData[i]?.value)
        }
    }
    return {
        label,
        data,
    }
}

const getTable = (header: any, details: any) => {
    const columns: IColumn<any, any>[] = []
    const row: any[] = []
    if (header && header.length) {
        for (let i = 0; i < header.length; i += 1) {
            columns.push({
                field: header[i],
                headerName: snakeCaseToLabel(header[i]),
                type: 'string',
                sortable: true,
                resizable: true,
                filter: true,
                flex: 1,
            })
        }
    }
    if (details) {
        const { rows, headers } = details
        if (rows && rows.length) {
            for (let i = 0; i < rows.length; i += 1) {
                const object = Object.fromEntries(
                    headers.map((key: any, index: any) => [
                        key,
                        typeof rows[i][index] === 'string'
                            ? rows[i][index]
                            : JSON.stringify(rows[i][index]),
                    ])
                )
                row.push({ id: i, ...object })
            }
        }
    }
    return {
        columns,
        row,
    }
}

const gridOptions: GridOptions = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
            },
            {
                id: 'filters',
                labelDefault: 'Table Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
            },
            {
                id: 'uniqueCount',
                labelDefault: 'Unique Counts',
                labelKey: 'uniqueCount',
                toolPanel: InsightTablePanel,
            },
        ],
        defaultToolPanel: '',
    },
}

interface IInsightDetail {
    id: string | undefined
    ws: string | undefined
    activeTimeRange: { start: Dayjs; end: Dayjs }
    selectedConnections: IFilter
}

export default function InsightDetail({
    id,
    ws,
    activeTimeRange,
    selectedConnections,
}: IInsightDetail) {
    const [detailsDate, setDetailsDate] = useState<string>('')
    const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'area'>(
        'line'
    )
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
        if (selectedIndex === 0) setSelectedChart('line')
        if (selectedIndex === 1) setSelectedChart('bar')
    }, [selectedIndex])

    const [modalData, setModalData] = useState('')
    const setNotification = useSetAtom(notificationAtom)
    const setQuery = useSetAtom(queryAtom)

    const start = () => {
        if (detailsDate === '') {
            return activeTimeRange.start
        }
        const d = new Date(0)
        d.setUTCSeconds(parseInt(detailsDate, 10) - 1)
        return dayjs.utc(d)
    }
    const end = () => {
        if (detailsDate === '') {
            return activeTimeRange.end || activeTimeRange.start
        }
        const d = new Date(0)
        d.setUTCSeconds(parseInt(detailsDate, 10) + 1)
        return dayjs.utc(d)
    }

    const query = {
        ...(selectedConnections.provider && {
            connector: [selectedConnections.provider],
        }),
        ...(selectedConnections.connections && {
            connectionId: selectedConnections.connections,
        }),
        ...(selectedConnections.connectionGroup && {
            connectionGroup: selectedConnections.connectionGroup,
        }),
        ...(activeTimeRange.start && {
            startTime: activeTimeRange.start.unix(),
        }),
        ...(activeTimeRange.end && {
            endTime: activeTimeRange.end.unix(),
        }),
    }

    const detailsQuery = {
        ...(selectedConnections.provider && {
            connector: [selectedConnections.provider],
        }),
        ...(selectedConnections.connections && {
            connectionId: selectedConnections.connections,
        }),
        ...(selectedConnections.connectionGroup && {
            connectionGroup: selectedConnections.connectionGroup,
        }),
        ...(activeTimeRange.start && {
            startTime: start().unix(),
            endTime: end().unix(),
        }),
    }

    const { response: insightTrend, isLoading: trendLoading } =
        useComplianceApiV1InsightTrendDetail(String(id), query)
    const { response: insightDetail, isLoading: detailLoading } =
        useComplianceApiV1InsightDetail(String(id), detailsQuery)

    const columns =
        insightDetail?.result && insightDetail?.result[0]?.details
            ? insightDetail?.result[0].details.headers
            : []
    const rows = insightDetail?.result
        ? insightDetail?.result[0].details
        : undefined

    const trendDates = () => {
        return (
            insightTrend?.map((item) => {
                const dt = item.timestamp || 0
                const d = new Date(0)
                d.setUTCSeconds(dt)
                return (
                    <SelectItem value={dt.toString()}>
                        {d.toLocaleString()}
                    </SelectItem>
                )
            }) || []
        )
    }

    return (
        <>
            <Header
                breadCrumb={[
                    insightDetail
                        ? insightDetail?.shortTitle
                        : 'Insight detail',
                ]}
                datePicker
                filter
            />
            {trendLoading || detailLoading ? (
                <Flex justifyContent="center" className="mt-56">
                    <Spinner />
                </Flex>
            ) : (
                <>
                    <Flex className="mb-6">
                        <Flex
                            flexDirection="col"
                            alignItems="start"
                            justifyContent="start"
                        >
                            <Title className="font-semibold whitespace-nowrap">
                                {insightDetail?.shortTitle}
                            </Title>
                            <Text>{insightDetail?.description}</Text>
                        </Flex>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setModalData(
                                    insightDetail?.query?.queryToExecute?.replace(
                                        '$IS_ALL_CONNECTIONS_QUERY',
                                        'true'
                                    ) || ''
                                )
                            }
                        >
                            See query
                        </Button>
                    </Flex>
                    <Modal
                        open={!!modalData.length}
                        onClose={() => setModalData('')}
                    >
                        <Title className="font-semibold">Insight query</Title>
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
                                    <Link to={`/${ws}/finder`}>
                                        Open in finder
                                    </Link>
                                </Button>
                                <Button onClick={() => setModalData('')}>
                                    Close
                                </Button>
                            </Flex>
                        </Flex>
                    </Modal>
                    <Card className="mb-4 gap-4">
                        <Grid numItems={4} className="w-full gap-4 mb-4">
                            <SummaryCard
                                border={false}
                                title="Total result"
                                metric={insightDetail?.totalResultValue}
                                metricPrev={insightDetail?.oldTotalResultValue}
                                loading={detailLoading}
                                deltaType={badgeTypeByDelta(
                                    insightDetail?.oldTotalResultValue,
                                    insightDetail?.totalResultValue
                                )}
                                delta={`${percentageByChange(
                                    insightDetail?.oldTotalResultValue,
                                    insightDetail?.totalResultValue
                                )}%`}
                            />
                            {insightDetail?.result &&
                                !!insightDetail?.result[0]?.connections
                                    ?.length && (
                                    <div className="pl-4 border-l border-l-gray-200">
                                        <SummaryCard
                                            border={false}
                                            title="Evaluated"
                                            loading={detailLoading}
                                            metric={
                                                insightDetail?.result
                                                    ? insightDetail?.result[0]
                                                          ?.connections?.length
                                                    : 0
                                            }
                                        />
                                    </div>
                                )}
                            <Col numColSpan={2}>
                                <Flex justifyContent="end" alignItems="start">
                                    <TabGroup
                                        index={selectedIndex}
                                        onIndexChange={setSelectedIndex}
                                        className="w-fit rounded-lg"
                                    >
                                        <TabList variant="solid">
                                            <Tab value="line">
                                                <LineChartIcon className="h-5" />
                                            </Tab>
                                            <Tab value="bar">
                                                <BarChartIcon className="h-5" />
                                            </Tab>
                                        </TabList>
                                    </TabGroup>
                                </Flex>
                            </Col>
                        </Grid>
                        <Flex justifyContent="end" className="gap-2.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-kaytu-950" />
                            <Text>Insight count</Text>
                        </Flex>
                        <Chart
                            labels={chartData(insightTrend).label}
                            chartData={chartData(insightTrend).data}
                            chartType={selectedChart}
                        />
                    </Card>
                    <Card>
                        {detailsDate !== '' && (
                            <Flex
                                flexDirection="row"
                                className="bg-kaytu-50 my-2 rounded-md pr-6"
                            >
                                <Callout
                                    title={`The available data for the result is exclusively limited to ${end().format(
                                        'MMM DD, YYYY'
                                    )}.`}
                                    color="blue"
                                    icon={ExclamationCircleIcon}
                                    className="w-full text-xs leading-5 truncate max-w-full"
                                >
                                    <Flex flexDirection="row">
                                        <Text className="text-kaytu-800">
                                            The following results present you
                                            with a partial result based on the
                                            filter you have selected.
                                        </Text>
                                    </Flex>
                                </Callout>
                                <Button
                                    variant="secondary"
                                    onClick={() => setDetailsDate('')}
                                >
                                    Show All
                                </Button>
                            </Flex>
                        )}
                        <Table
                            title="Results"
                            id="insight_detail"
                            columns={getTable(columns, rows).columns}
                            rowData={getTable(columns, rows).row}
                            downloadable
                            options={gridOptions}
                            loading={detailLoading}
                        >
                            <Select
                                className="h-full"
                                onValueChange={setDetailsDate}
                                placeholder={
                                    detailsDate === ''
                                        ? 'Latest'
                                        : end().format('MMM DD, YYYY')
                                }
                            >
                                {trendDates()}
                            </Select>
                        </Table>
                    </Card>
                </>
            )}
        </>
    )
}