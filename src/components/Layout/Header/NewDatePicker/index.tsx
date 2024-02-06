import dayjs from 'dayjs'
import { Popover, Transition } from '@headlessui/react'
import { Card, Flex, Text } from '@tremor/react'
import { CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Fragment, useState } from 'react'
import { defaultTime, useURLParam } from '../../../../utilities/urlstate'
import { IDate } from '../../../../pages/Governance/Findings/Filter/Datepicker'
import { renderDateText } from '../DatePicker'
import ConditionDropdown from '../../../../pages/Governance/Findings/Filter/ConditionDropdown'
import Datepicker from './Datepicker'

export default function NewDatePicker() {
    const [condition, setCondition] = useState('isBetween')
    const [activeTimeRange, setActiveTimeRange] = useURLParam<IDate>(
        'dateRange',
        defaultTime,
        (v) => {
            return `${v.start.format('YYYY-MM-DD HH:mm:ss')} - ${v.end.format(
                'YYYY-MM-DD HH:mm:ss'
            )}`
        },
        (v) => {
            const arr = v
                .replaceAll('+', ' ')
                .split(' - ')
                .map((m) => dayjs(m))
            return {
                start: arr[0],
                end: arr[1],
            }
        }
    )

    return (
        <Popover className="relative border-0">
            <Popover.Button
                id="timepicker"
                className="border border-kaytu-500 text-kaytu-500 bg-kaytu-50 py-1.5 px-2 rounded-md"
            >
                <Flex className="w-fit gap-2">
                    <CalendarIcon className="w-4 text-inherit" />
                    <Text className="text-inherit w-fit whitespace-nowrap">
                        {renderDateText(
                            activeTimeRange.start,
                            activeTimeRange.end
                        )}
                    </Text>
                    <ChevronDownIcon className="w-3 text-inherit" />
                </Flex>
            </Popover.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel
                    static
                    className="absolute z-50 top-full right-0"
                >
                    <Card className="mt-2 p-4 min-w-[256px] w-fit">
                        <Flex className="w-fit gap-1.5">
                            <Text className="font-semibold">Date</Text>
                            <ConditionDropdown
                                onChange={(c) => setCondition(c)}
                                conditions={['isBetween', 'isRelative']}
                                isDate
                            />
                        </Flex>
                        <Datepicker condition={condition} />
                    </Card>
                </Popover.Panel>
            </Transition>
        </Popover>
    )
}