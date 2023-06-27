import {
    Card,
    AccordionList,
    Metric,
    Text,
    Flex,
    ProgressBar,
    Grid,
    Icon,
    Title,
    Divider,
    Bold,
    Accordion,
    AccordionBody,
    AccordionHeader,
    BarList,
    Color,
    List,
    ListItem,
} from '@tremor/react'
import React from 'react'
import { numericDisplay } from '../../../../../utilities/numericDisplay'

const MockData = {
    TopTotalResCount: [
        {
            name: 'gbs-pipeline-test15',
            resourceCount: 43445,
        },
        {
            name: 'TAA-BO-CPM_GEAC-Z-DevTest-Labs',
            resourceCount: 35545,
        },
        {
            name: 'gbs-pipeline-test17',
            resourceCount: 34552,
        },
        {
            name: 'Gurutestsub',
            resourceCount: 30545,
        },
        {
            name: 'testOleskandrk2',
            resourceCount: 20545,
        },
    ],
    TopResCount: [
        {
            name: 'gbs-pipeline-test15',
            resourceCount: 43445,
        },
        {
            name: 'TAA-BO-CPM_GEAC-Z-DevTest-Labs',
            resourceCount: 35545,
        },
        {
            name: 'gbs-pipeline-test17',
            resourceCount: 34552,
        },
        {
            name: 'Gurutestsub',
            resourceCount: 30545,
        },
        {
            name: 'testOleskandrk2',
            resourceCount: 20545,
        },
    ],
    totalAccountCount: 920,
    totalUnhealthyCount: 10,
}

interface Data {
    name: string
    value: number
}

const item = {
    total: {
        title: 'Services',
        value: 190,
    },
    TopXServices: [
        {
            title: 'Services',
            value: 190,
        },
        {
            title: 'Services',
            value: 190,
        },
        {
            title: 'Services',
            value: 190,
        },
        {
            title: 'Services',
            value: 190,
        },
        {
            title: 'Services',
            value: 190,
        },
    ],
    TopXFastest: [
        {
            title: 'Services',
            value: 190,
            change: 60,
            type: 'moderateIncrease',
        },
        {
            title: 'Services',
            value: 190,
            change: 60,
            type: 'moderateIncrease',
        },
        {
            title: 'Services',
            value: 190,
            change: 60,
            type: 'moderateIncrease',
        },
        {
            title: 'Services',
            value: 190,
            change: 60,
            type: 'moderateIncrease',
        },
        {
            title: 'Services',
            value: 190,
            change: 60,
            type: 'moderateIncrease',
        },
    ],
}

type IProps = {
    serviceList: any
}
export default function Summary({ serviceList }: IProps) {
    console.log('serviceList', serviceList)
    return (
        <Grid numItemsLg={3} className="gap-x-10 mt-5">
            <Card key="Total Services" className="h-fit">
                <Flex justifyContent="start" className="space-x-4">
                    <Title className="truncate">Total Services</Title>
                </Flex>
                {/* <Text> */}
                {/*    Last Inspection: <Bold>{item.date}</Bold> */}
                {/* </Text> */}
                <Metric className="mt-4 mb-3">
                    {numericDisplay(item.total.value)}
                </Metric>
            </Card>
            <Card key="TopXServices" className="h-fit">
                <Flex justifyContent="start" className="space-x-4">
                    <Title className="truncate">TopXServices</Title>
                </Flex>
                {/* <Text> */}
                {/*    Last Inspection: <Bold>{item.date}</Bold> */}
                {/* </Text> */}
                <Accordion className="mt-4">
                    <AccordionHeader>
                        <div className="space-y-2">
                            <Text>Services</Text>
                        </div>
                    </AccordionHeader>
                    <AccordionBody>
                        <List className="mt-2">
                            {MockData.TopTotalResCount.map((thing) => (
                                <ListItem key={thing.name}>
                                    <Text>{thing.name}</Text>
                                    <Text>
                                        <Bold>
                                            {numericDisplay(
                                                thing.resourceCount
                                            )}
                                        </Bold>{' '}
                                    </Text>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionBody>
                </Accordion>
            </Card>
            <Card key="TopXFastest" className="h-fit">
                <Flex justifyContent="start" className="space-x-4">
                    <Title className="truncate">TopXFastest</Title>
                </Flex>
                {/* <Text> */}
                {/*    Last Inspection: <Bold>{item.date}</Bold> */}
                {/* </Text> */}
                <Accordion className="mt-4">
                    <AccordionHeader>
                        <div className="space-y-2">
                            <Text>Services</Text>
                        </div>
                    </AccordionHeader>
                    <AccordionBody>
                        <List className="mt-2">
                            {item.TopXFastest.map((thing) => (
                                <ListItem key={thing.title}>
                                    <Text>{thing.title}</Text>
                                    <Text>
                                        <Bold>
                                            {numericDisplay(thing.value)}
                                        </Bold>{' '}
                                    </Text>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionBody>
                </Accordion>
            </Card>
        </Grid>
    )
}