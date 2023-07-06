import {
    Bold,
    Card,
    Flex,
    List,
    ListItem,
    Tab,
    TabGroup,
    TabList,
    Text,
    Title,
} from '@tremor/react'
import {
    JSXElementConstructor,
    Key,
    ReactElement,
    ReactNode,
    useState,
} from 'react'
import { numericDisplay } from '../../../utilities/numericDisplay'
import Spinner from '../../Spinner'

type IProps = {
    // count?: any
    // provider?: any
    // connections?: any
    title?: any
    tabs?: any
    data?: any
    loading?: boolean
    listTitle?: string
    isPercentage?: boolean
}

export default function CardWithList({
    title = '',
    tabs = [],
    data = {},
    loading = false,
    listTitle = '',
    isPercentage = false,
}: IProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    // eslint-disable-next-line consistent-return
    const tabDetails = (tab: string) => {
        try {
            return data[tab].map(
                (item: {
                    name:
                        | boolean
                        | Key
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | null
                        | undefined
                    value: string | number | undefined
                }) => (
                    <ListItem>
                        <Text>{item.name}</Text>
                        {item.value && (
                            <Flex justifyContent="end" className="space-x-2">
                                {!isPercentage ? (
                                    <Text>{numericDisplay(item.value)}</Text>
                                ) : (
                                    <Text>{item.value}</Text>
                                )}
                            </Flex>
                        )}
                    </ListItem>
                )
            )
        } catch (e) {
            console.log(e)
            return null
        }
    }

    return loading ? (
        <Card>
            <Flex className="h-96">
                <Spinner />
            </Flex>
        </Card>
    ) : (
        <Card>
            <Flex alignItems="start">
                <Title>{title}</Title>
            </Flex>
            <TabGroup
                index={selectedIndex}
                onIndexChange={setSelectedIndex}
                className="mt-3"
            >
                <TabList>
                    {/* {formattedData && */}
                    {/*    tabs.map((item) => <Tab key={item}>{item}</Tab>)} */}
                    {tabs.map((item: any) => (
                        <Tab key={item}>{item}</Tab>
                    ))}
                </TabList>
            </TabGroup>
            <List>
                <Flex justifyContent="between">
                    <Bold>{listTitle}</Bold>
                </Flex>
                {tabDetails(tabs[selectedIndex])}
            </List>
        </Card>
    )
}