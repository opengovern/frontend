import { Grid } from '@tremor/react'
import dayjs from 'dayjs'
import { useOnboardApiV1ConnectionsSummaryList } from '../../../../api/onboard.gen'
import { useInventoryApiV2CostMetricList } from '../../../../api/inventory.gen'
import SummaryCard from '../../../../components/Cards/SummaryCard'
import { numericDisplay } from '../../../../utilities/numericDisplay'

interface IProps {
    provider: any
    timeRange: any
    connection: any
    pageSize: any
    setActiveSubPage: (subPage: string) => void
}

export default function SummaryMetrics({
    provider,
    timeRange,
    pageSize,
    connection,
    setActiveSubPage,
}: IProps) {
    const query = {
        ...(provider && { connector: provider }),
        ...(connection && { connectionId: connection }),
        ...(timeRange.from && { startTime: dayjs(timeRange.from).unix() }),
        ...(timeRange.to && { endTime: dayjs(timeRange.to).unix() }),
        ...(pageSize && { pageSize }),
    }
    const { response: accounts, isLoading: accountsLoading } =
        useOnboardApiV1ConnectionsSummaryList({
            connector: provider,
            connectionId: connection,
            startTime: dayjs(timeRange.from).unix(),
            endTime: dayjs(timeRange.to).unix(),
            pageSize: 10000,
            pageNumber: 1,
        })
    const { response: metrics, isLoading: metricLoading } =
        useInventoryApiV2CostMetricList(query)
    // const { response: services } = useInventoryApiV2ServicesSummaryList({
    //     connector: provider,
    //     connectionId: connection,
    // })
    // const { data: services, isLoading: serviceLodaing } = useTopServices(
    //     provider,
    //     connections
    // )
    // const lowerProvider = provider.toLowerCase()

    return (
        <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
            <span>
                {/* Placeholder to set height */}
                {/* <div className="h-28" /> */}
                <SummaryCard
                    title="Accounts Total Cost"
                    metric={`$ ${String(numericDisplay(accounts?.totalCost))}`}
                    // metricPrev={MockData[0].metricPrev}
                    // delta={MockData[0].delta}
                    // deltaType={MockData[0].deltaType}
                    // areaChartData={[{}]}
                    // viewMore
                    // onClick={() => setActiveSubPage('Accounts')}
                    loading={accountsLoading}
                />
            </span>
            <span>
                {/* Placeholder to set height */}
                {/* <div className="h-28" /> */}
                <SummaryCard
                    title="Services"
                    metric={String(numericDisplay(metrics?.total_count))}
                    // metricPrev={MockData[1].metricPrev}
                    // delta={MockData[1].delta}
                    // deltaType={MockData[1].deltaType}
                    // areaChartData={[{}]}
                    // viewMore
                    // onClick={() => setActiveSubPage('Services')}
                    loading={metricLoading}
                />
            </span>
            <span>
                {/* Placeholder to set height */}
                {/* <div className="h-28" /> */}
                <SummaryCard
                    title="Total Spend"
                    metric={`$ ${String(numericDisplay(metrics?.total_cost))}`}
                    // metricPrev={MockData[2].metricPrev}
                    // delta={MockData[2].delta}
                    // deltaType={MockData[2].deltaType}
                    // areaChartData={[{}]}
                    // viewMore
                    // onClick={() => setActiveSubPage('Resources')}
                    loading={metricLoading}
                />
            </span>
        </Grid>
    )
}