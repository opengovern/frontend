import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react'
import Subscriptions from './Subscriptions'
import Principals from './Principals'

interface IAWS {
    principals: any
    subscriptions: any
}

export default function AzureTabs({ principals, subscriptions }: IAWS) {
    return (
        <TabGroup>
            <TabList className="mb-3">
                <Tab>Principals</Tab>
                <Tab>Azure Subscriptions</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Principals principals={principals} />
                </TabPanel>
                <TabPanel>
                    <Subscriptions subscriptions={subscriptions} />
                </TabPanel>
            </TabPanels>
        </TabGroup>
    )
}