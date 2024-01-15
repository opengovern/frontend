import { Button, Card, Flex, Text, Title } from '@tremor/react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { useComplianceApiV1BenchmarksSummaryList } from '../../../../api/compliance.gen'
import { getErrorMessage } from '../../../../types/apierror'
import { benchmarkList } from '../../../Governance/Compliance'

const colors = [
    'fuchsia',
    'indigo',
    'slate',
    'gray',
    'zinc',
    'neutral',
    'stone',
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'violet',
    'purple',
    'pink',
    'rose',
]

export default function Compliance() {
    const workspace = useParams<{ ws: string }>().ws
    const navigate = useNavigate()

    const {
        response: benchmarks,
        isLoading,
        error,
        sendNow: refresh,
    } = useComplianceApiV1BenchmarksSummaryList()

    return (
        <Flex flexDirection="col" alignItems="start" justifyContent="start">
            <Flex className="mb-4">
                <Title>Benchmarks</Title>
                <Button
                    variant="light"
                    icon={ChevronRightIcon}
                    iconPosition="right"
                    onClick={() => navigate(`/${workspace}/compliance`)}
                >
                    View details
                </Button>
            </Flex>
            {isLoading || getErrorMessage(error).length > 0 ? (
                <Flex flexDirection="col" className="gap-4">
                    {[1, 2].map((i) => {
                        return (
                            <Card className="p-3 dark:ring-gray-500">
                                <Flex
                                    flexDirection="col"
                                    alignItems="start"
                                    justifyContent="start"
                                    className="animate-pulse"
                                >
                                    <div className="h-5 w-24 mb-2 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="h-5 w-24 mb-1 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                                </Flex>
                            </Card>
                        )
                    })}
                </Flex>
            ) : (
                <Flex flexDirection="col" className="gap-4">
                    {benchmarkList(benchmarks?.benchmarkSummary).connected?.map(
                        (bs, i) =>
                            i < 2 && (
                                <Card
                                    onClick={() =>
                                        navigate(
                                            `/${workspace}/compliance/${bs.id}`
                                        )
                                    }
                                    className="p-3 cursor-pointer dark:ring-gray-500"
                                >
                                    <Flex
                                        flexDirection="col"
                                        alignItems="start"
                                    >
                                        <Text className="font-semibold text-gray-800 mb-2">
                                            {bs.title}
                                        </Text>
                                        <Text>Security score</Text>
                                        <Title>
                                            {(
                                                ((bs?.controlsSeverityStatus
                                                    ?.total?.passed || 0) /
                                                    (bs?.controlsSeverityStatus
                                                        ?.total?.total || 1)) *
                                                    100 || 0
                                            ).toFixed(1)}
                                            %
                                        </Title>
                                    </Flex>
                                </Card>
                            )
                    )}
                    {benchmarkList(benchmarks?.benchmarkSummary).connected
                        .length < 2 &&
                        benchmarkList(
                            benchmarks?.benchmarkSummary
                        ).notConnected.map(
                            (bs, i) =>
                                i <
                                    4 -
                                        benchmarkList(
                                            benchmarks?.benchmarkSummary
                                        ).connected.length *
                                            2 && (
                                    <Card
                                        onClick={() =>
                                            navigate(
                                                `/${workspace}/compliance/${bs.id}`
                                            )
                                        }
                                        className="p-3 cursor-pointer dark:ring-gray-500"
                                    >
                                        <Flex>
                                            <Text className="font-semibold line-clamp-1 text-gray-800">
                                                {bs.title}
                                            </Text>
                                            <Button
                                                variant="light"
                                                icon={ChevronRightIcon}
                                                iconPosition="right"
                                            >
                                                Assign
                                            </Button>
                                        </Flex>
                                    </Card>
                                )
                        )}
                    {error && (
                        <Flex
                            flexDirection="col"
                            justifyContent="between"
                            className="absolute top-0 w-full left-0 h-full backdrop-blur"
                        >
                            <Flex
                                flexDirection="col"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Title className="mt-6">
                                    Failed to load component
                                </Title>
                                <Text className="mt-2">
                                    {getErrorMessage(error)}
                                </Text>
                            </Flex>
                            <Button
                                variant="secondary"
                                className="mb-6"
                                color="slate"
                                onClick={refresh}
                            >
                                Try Again
                            </Button>
                        </Flex>
                    )}
                </Flex>
            )}
        </Flex>
    )
}