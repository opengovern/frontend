import { Col, Grid } from '@tremor/react'
import { useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import Layout from '../../../components/Layout'
import SingleSpendConnection from '../Single/SingleConnection'
import {
    useInventoryApiV2AnalyticsSpendMetricList,
    useInventoryApiV2AnalyticsSpendTableList,
    useInventoryApiV2AnalyticsSpendTrendList,
} from '../../../api/inventory.gen'
import { filterAtom, spendTimeAtom } from '../../../store'
import { SpendChart } from '../../../components/Spend/Chart'
import { toErrorMessage } from '../../../types/apierror'
import { Granularity } from '../../../components/Spend/Chart/Selectors'
import AccountTable from './AccountTable'
import { GithubComKaytuIoKaytuEnginePkgInventoryApiCostTrendDatapoint } from '../../../api/api'

export function SpendAccounts() {
    const activeTimeRange = useAtomValue(spendTimeAtom)
    const selectedConnections = useAtomValue(filterAtom)
    const [chartGranularity, setChartGranularity] =
        useState<Granularity>('daily')
    const [tableGranularity, setTableGranularity] =
        useState<Granularity>('daily')

    const query: {
        pageSize: number
        pageNumber: number
        sortBy: 'cost' | undefined
        endTime: number
        startTime: number
        connectionId: string[]
        connector?: ('AWS' | 'Azure')[] | undefined
    } = {
        ...(selectedConnections.provider !== '' && {
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
        pageSize: 5,
        pageNumber: 1,
        sortBy: 'cost',
    }

    const duration = activeTimeRange.end.diff(activeTimeRange.start, 'second')
    const prevTimeRange = {
        start: activeTimeRange.start.add(-duration, 'second'),
        end: activeTimeRange.end.add(-duration, 'second'),
    }
    const prevQuery = {
        ...query,
        ...(activeTimeRange.start && {
            startTime: prevTimeRange.start.unix(),
        }),
        ...(activeTimeRange.end && {
            endTime: prevTimeRange.end.unix(),
        }),
    }

    const {
        response: serviceCostResponse,
        isLoading: serviceCostLoading,
        error: serviceCostErr,
        sendNow: serviceCostRefresh,
    } = useInventoryApiV2AnalyticsSpendMetricList(query)
    const {
        response: servicePrevCostResponse,
        isLoading: servicePrevCostLoading,
        error: servicePrevCostErr,
        sendNow: serviceCostPrevRefresh,
    } = useInventoryApiV2AnalyticsSpendMetricList(prevQuery)

    const { response: responseChart, isLoading: isLoadingChart } =
        useInventoryApiV2AnalyticsSpendTableList({
            startTime: activeTimeRange.start.unix(),
            endTime: activeTimeRange.end.unix(),
            dimension: 'connection',
            granularity: chartGranularity,
            connector: [selectedConnections.provider],
            connectionId: selectedConnections.connections,
            connectionGroup: selectedConnections.connectionGroup,
        })

    const { response, isLoading } = useInventoryApiV2AnalyticsSpendTableList({
        startTime: activeTimeRange.start.unix(),
        endTime: activeTimeRange.end.unix(),
        dimension: 'connection',
        granularity: tableGranularity,
        connector: [selectedConnections.provider],
        connectionId: selectedConnections.connections,
        connectionGroup: selectedConnections.connectionGroup,
    })
    const { response: responsePrev, isLoading: prevIsLoading } =
        useInventoryApiV2AnalyticsSpendTableList({
            startTime: prevTimeRange.start.unix(),
            endTime: prevTimeRange.end.unix(),
            dimension: 'connection',
            granularity: tableGranularity,
            connector: [selectedConnections.provider],
            connectionId: selectedConnections.connections,
            connectionGroup: selectedConnections.connectionGroup,
        })

    const accountTrend = () => {
        return responseChart
            ?.flatMap((item) =>
                Object.entries(item.costValue || {}).map((entry) => {
                    return {
                        accountID: item.dimensionId || item.accountID || '',
                        accountName: item.dimensionName,
                        date: entry[0],
                        cost: entry[1],
                    }
                })
            )
            .reduce<
                GithubComKaytuIoKaytuEnginePkgInventoryApiCostTrendDatapoint[]
            >((prev, curr) => {
                const stacked = {
                    cost: curr.cost,
                    metricID: curr.accountID,
                    metricName: curr.accountName,
                }
                const exists =
                    prev.filter((p) => p.date === curr.date).length > 0
                console.log(exists)
                if (exists) {
                    return prev.map((p) => {
                        if (p.date === curr.date) {
                            return {
                                cost: (p.cost || 0) + curr.cost,
                                costStacked: [
                                    ...(p.costStacked || []),
                                    stacked,
                                ],
                                date: curr.date,
                            }
                        }
                        return p
                    })
                }
                return [
                    ...prev,
                    {
                        cost: curr.cost,
                        costStacked: [stacked],
                        date: curr.date,
                    },
                ]
            }, [])
    }

    const chartRef = useRef<any>(null)
    // const ref = useRef<any>(null)
    // const [lastScrollTop, setLastScrollTop] = useState<number>(0)
    // const handleScroll = (event: any) => {
    //     const scrollTop = event.target?.scrollTop || 0
    //     const diff = scrollTop - lastScrollTop
    //     if (diff > 40) {
    //         ref.current?.scrollTo({
    //             top: chartRef.current.scrollHeight + 30,
    //             behavior: 'smooth',
    //         })
    //     } else if (diff < -40) {
    //         ref.current?.scrollTo({
    //             top: 0,
    //             behavior: 'smooth',
    //         })
    //     } else if (scrollTop < chartRef.current.scrollHeight / 2) {
    //         ref.current?.scrollTo({
    //             top: 0,
    //             behavior: 'smooth',
    //         })
    //     } else {
    //         ref.current?.scrollTo({
    //             top: chartRef.current.scrollHeight + 30,
    //             behavior: 'smooth',
    //         })
    //     }
    //     setLastScrollTop(event.target?.scrollTop || 0)
    // }

    return (
        <Layout
            currentPage="spend/accounts"
            datePicker
            filter
            // onScroll={handleScroll}
            // scrollRef={ref}
        >
            {selectedConnections.connections.length === 1 ? (
                <SingleSpendConnection
                    activeTimeRange={activeTimeRange}
                    id={selectedConnections.connections[0]}
                />
            ) : (
                <Grid numItems={3} className="w-full gap-4">
                    <Col numColSpan={3} ref={chartRef}>
                        <SpendChart
                            costTrend={accountTrend() || []}
                            costField="metric"
                            title="Total spend"
                            timeRange={activeTimeRange}
                            timeRangePrev={prevTimeRange}
                            total={serviceCostResponse?.total_cost || 0}
                            totalPrev={servicePrevCostResponse?.total_cost || 0}
                            // noStackedChart
                            isLoading={
                                serviceCostLoading ||
                                servicePrevCostLoading ||
                                isLoadingChart
                            }
                            error={toErrorMessage(
                                serviceCostErr,
                                servicePrevCostErr
                            )}
                            onRefresh={() => {
                                serviceCostPrevRefresh()
                                serviceCostRefresh()
                            }}
                            onGranularityChanged={setChartGranularity}
                        />
                    </Col>
                    <Col numColSpan={3} className="mt-6">
                        <AccountTable
                            isLoading={isLoading || prevIsLoading}
                            response={response}
                            responsePrev={responsePrev}
                            onGranularityChange={setTableGranularity}
                            selectedGranularity={tableGranularity}
                            timeRange={activeTimeRange}
                            prevTimeRange={prevTimeRange}
                        />
                    </Col>
                </Grid>
            )}
        </Layout>
    )
}